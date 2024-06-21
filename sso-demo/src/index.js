const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const port = 3000;
const usersFilePath = path.join(__dirname, "../../fake-database/user.json");
const accessTokenSecret = "sso-access-token-secret";
const refreshTokenSecret = "sso-refresh-token-secret";
const wechatAppID = "wx7283eac281febaaf";
const wechatAppSecret = "24c6cff0c5ffec4dd1e0eacb33c46aa6";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:4000",
      "http://localhost:5000",
      "http://localhost:6000",
    ],
    credentials: true,
  })
);

// 读取用户数据
const readUsersFromFile = () => {
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

// 写入用户数据
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// 生成Access Token
const generateAccessToken = (username) => {
  return jwt.sign({ username }, accessTokenSecret, { expiresIn: "30s" });
};

// 生成Refresh Token
const generateRefreshToken = (username) => {
  return jwt.sign({ username }, refreshTokenSecret, { expiresIn: "2m" });
};

app.post("/wechat-login", async (req, res) => {
  const { code } = req.body;

  try {
    // 通过 code 获取微信 access token 和 openid
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${wechatAppID}&secret=${wechatAppSecret}&js_code=${code}&grant_type=authorization_code`
    );
    const { openid, session_key } = response.data;

    console.log(`微信code${code}返回Log：`, response.data);

    let users = readUsersFromFile();
    let user = users.find((u) => u.openid === openid);

    if (!user) {
      user = {
        id: openid,
        username: "微信用户" + openid.slice(0, -7),
        password: 123456,
        openid,
        session_key,
        avatar:
          "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
        createTime: Date.now(),
        updateTime: Date.now(),
      };
      users.push(user);
      writeUsersToFile(users);
    } else {
      user.session_key = session_key;
      writeUsersToFile(users);
    }

    // 使用 openid 作为用户名生成 SSO 的 access token 和 refresh token
    const accessToken = generateAccessToken(openid);
    const refreshToken = generateRefreshToken(openid);

    // 设置 refresh token 到 cookie 中
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/refresh-token",
    });

    res.json({ accessToken, userId: user.id });
  } catch (error) {
    console.error("Error fetching WeChat access token:", error);
    res.status(500).json({ message: "WeChat login failed" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Center Login Log", req.body);

  if (username === "admin" && password === "123456") {
    const accessToken = generateAccessToken(username);
    const refreshToken = generateRefreshToken(username);

    // 1.jwt token生成后注入cookie，通过响应头set-cookie返回浏览器，浏览器将在domain以及其他条件符合的情况下存储cookie并在发送请求时自动带上
    // 3. 对比localStroage的token存储方案，cookie这些安全配置项能有效避免攻击风险

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/refresh-token",
    });
    return res.json({ accessToken });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// 刷新token接口
app.post("/refresh-token", (req, res) => {
  // 使用正则表达式从 Cookie 字符串中解析出 refresh_token
  const cookieString = req.headers.cookie;

  const refreshTokenMatch =
    cookieString && cookieString.match(/refresh_token=([^;]+)/);
  const refresh_token = refreshTokenMatch ? refreshTokenMatch[1] : null;
  if (!refresh_token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  jwt.verify(refresh_token, refreshTokenSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(decoded.username);
    res.json({ accessToken });
  });
});

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

app.get("/verify", authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

app.post("/logout", (req, res) => {
  const { appid } = req.body;
  console.log("Logout From", appid);
  // 2.logout的时候返回clearCookie的
  res.clearCookie("refresh_token", { domain: "127.0.0.1" });
  res.json({ message: "Center Logged out" });
});

app.listen(port, () => {
  console.log(`SSO server listening at http://localhost:${port}`);
});
