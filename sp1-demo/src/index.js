const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");
const { parseCookies } = require("./utils/index");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.post("/login", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:3000/login", {
      username: req.body.username,
      password: req.body.password,
    });

    const cookies = parseCookies(response.headers["set-cookie"]);

    console.log(cookies);

    if (match) {
      // 假设验证逻辑成功，设置一个简单的 sso_token Cookie
      res.cookie("sso_token", cookies.sso_token, {
        httpOnly: true,
        domain: ".localhost",
        path: "/",
      });
    }

    res.json({ message: "Login App1" });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/logout", async (req, res) => {
  const response = await axios.post("http://localhost:3000/logout", {
    username: req.body.username,
    password: req.body.password,
  });

  res.json({ message: "Logged out in App1" });
});

app.get("/profile", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:3000/verify", {
      headers: {
        Cookie: `sso_token=${req.cookies.sso_token}`,
      },
      withCredentials: true,
    });

    res.json({ message: "Profile data", user: response.data.username });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(port, () => {
  console.log(`App1 listening at http://localhost:${port}`);
});
