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
    origin: "http://localhost:3000",
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

    res.cookie("sso_token", cookies.sso_token, {
      httpOnly: true, // 防止客户端JavaScript
      //   secure: true,
      domain: "127.0.0.1",
      path: "/",
    });

    res.json({ message: `Login ${appid}` });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/logout", async (req, res) => {
  await axios.post("http://localhost:3000/logout", {
    appid,
  });

  res.clearCookie("sso_token", { domain: "127.0.0.1" });
  res.json({ message: `Logged out in ${appid}` });
});

app.get("/dashboard", async (req, res) => {
  try {
    console.log(req.cookies);
    const response = await axios.get("http://localhost:3000/verify", {
      headers: {
        Cookie: `sso_token=${req.cookies.sso_token}`,
      },
      withCredentials: true,
    });

    res.json({ message: "Dashboard data", user: response.data.username });
  } catch (error) {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(port, () => {
  console.log(`${appid} listening at http://localhost:${port}`);
});
