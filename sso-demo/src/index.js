const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const port = 3000;
const secret = "sso-secret";

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

// 生成Access Token
const generateAccessToken = (username) => {
  return jwt.sign({ username }, accessTokenSecret, { expiresIn: "15m" });
};

// 生成Refresh Token
const generateRefreshToken = (username) => {
  return jwt.sign({ username }, refreshTokenSecret, { expiresIn: "1h" });
};

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
  const { refresh_token } = req.cookies;

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

app.get("/verify", (req, res) => {
  const token = req.cookies.sso_token;

  console.log(req.cookies);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.json({ username: decoded.username });
  });
});

app.post("/logout", (req, res) => {
  const { appid } = req.body;
  console.log("Logout From", appid);
  // 2.logout的时候返回clearCookie的
  res.clearCookie("sso_token", { domain: "127.0.0.1" });
  res.json({ message: "Center Logged out" });
});

app.listen(port, () => {
  console.log(`SSO server listening at http://localhost:${port}`);
});
