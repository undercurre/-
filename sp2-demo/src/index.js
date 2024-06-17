const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");
const utils = require("./utils/index");

const app = express();
const port = 5000;
const appid = "app2";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4001"],
    credentials: true,
  })
);

// 内存中存储的评论数据（用于演示）
const comments = [];

// 添加评论的端点
app.post("/comments", async (req, res) => {
  try {
    // 验证用户身份
    const response = await axios.get("http://localhost:3000/verify", {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });

    const { content, postId } = req.body;
    const username = response.data.username;

    if (!content || !postId) {
      return res
        .status(400)
        .json({ message: "Content and Post ID are required" });
    }

    // 添加评论到内存数据中
    const comment = { username, content, postId, createdAt: new Date() };
    comments.push(comment);

    res.json({ message: "Comment added", comment });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// 获取评论的端点
app.get("/comments", (req, res) => {
  res.json({ comments });
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
      // httpOnly: true, // 防止客户端JavaScript
      // secure: true,
      // sameSite: "strict", // 防止CSRF攻击，Strict模式完全阻止跨站请求携带Cookie，Lax模式允许一些跨站请求（如GET请求）
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
  res.json({ message: `Logged out in ${appid}` });
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

app.get("/dashboard", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3000/verify", {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });

    res.json({ message: "Dashboard data", user: response.data.username });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(port, () => {
  console.log(`${appid} listening at http://localhost:${port}`);
});
