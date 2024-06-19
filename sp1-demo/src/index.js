const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const utils = require("./utils/index");

const app = express();
const port = 4000;
const appid = "app1";
const usersFilePath = path.join(__dirname, "../../fake-database/user.json");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// 读取用户数据
const readUsersFromFile = () => {
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

// 写入用户数据
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// 获取所有用户
app.get("/users", (req, res) => {
  const users = readUsersFromFile();
  res.json(users);
});

// 获取单个用户
app.get("/users/:id", (req, res) => {
  const users = readUsersFromFile();
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// 创建新用户
app.post("/users", async (req, res) => {
  try {
    await axios.get("http://localhost:3000/verify", {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });
    const users = readUsersFromFile();
    const newUser = { id: Date.now(), ...req.body };
    users.push(newUser);
    writeUsersToFile(users);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 更新用户
app.put("/users/:id", (req, res) => {
  const users = readUsersFromFile();
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    writeUsersToFile(users);
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// 删除用户
app.delete("/users/:id", (req, res) => {
  let users = readUsersFromFile();
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    users = users.filter((u) => u.id !== parseInt(req.params.id));
    writeUsersToFile(users);
    res.json({ message: "User deleted" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:3000/login", {
      username: req.body.username,
      password: req.body.password,
      appid,
    });

    const cookies = utils.parseCookies(response.headers["set-cookie"][0]);

    res.cookie("refresh_token", cookies.refresh_token, {
      httpOnly: true, // 防止客户端JavaScript访问Cookie
      // secure: true, // 确保只能通过HTTPS连接传输Cookie
      // sameSite: 'lax', // 帮助防止 CSRF 攻击。Strict 模式完全阻止跨站请求携带 Cookie，Lax 模式允许一些跨站请求（如 GET 请求）
      domain: "127.0.0.1",
      path: "/",
    });

    res.json({ message: `Login ${appid}`, ...response.data });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/wechat-login", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:3000/wechat-login", {
      ...req.body,
    });

    const cookies = utils.parseCookies(response.headers["set-cookie"][0]);

    res.cookie("refresh_token", cookies.refresh_token, {
      httpOnly: true, // 防止客户端JavaScript访问Cookie
      // secure: true, // 确保只能通过HTTPS连接传输Cookie
      // sameSite: 'lax', // 帮助防止 CSRF 攻击。Strict 模式完全阻止跨站请求携带 Cookie，Lax 模式允许一些跨站请求（如 GET 请求）
      domain: "127.0.0.1",
      path: "/",
    });

    res.json({ message: `Login ${appid}`, ...response.data });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/logout", async (req, res) => {
  await axios.post("http://localhost:3000/logout", {
    appid,
  });

  res.clearCookie("refresh_token", { domain: "127.0.0.1" });
  res.json({ message: `Logged out From ${appid}` });
});

app.post("/refresh-token", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/refresh-token",
      null,
      {
        headers: {
          Cookie: req.headers.cookie, // 将请求中的 Cookie 带到转发的请求中
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response.status || 500).json({ error: error.message });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3000/verify", {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });

    res.json({ message: "Profile data", user: response.data.username });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(port, () => {
  console.log(`${appid} listening at http://localhost:${port}`);
});
