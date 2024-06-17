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

app.post("/login", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:3000/login", {
      username: req.body.username,
      password: req.body.password,
      appid,
    });

    const cookies = utils.parseCookies(response.headers["set-cookie"][0]);

    res.cookie("refresh_token", cookies.refresh_token, {
      httpOnly: true, // 防止客户端JavaScript
      //   secure: true,
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
