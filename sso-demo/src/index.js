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
      "http://localhost:3001",
      "http://localhost:4000",
      "http://localhost:5000",
      "http://localhost:6000",
    ],
    credentials: true,
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 简单的用户名和密码验证
  if (username === "admin" && password === "123456") {
    const token = jwt.sign({ username }, secret, { expiresIn: "1h" });

    // 将JWT设置为HTTP cookie
    res.cookie("sso_token", token, { httpOnly: true, domain: ".localhost" });
    return res.json({ message: "Login successful" });
  }

  res.status(401).json({ message: "Invalid credentials" });
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
  res.clearCookie("sso_token", { domain: ".local" });
  res.json({ message: "Logged out" });
});

app.listen(port, () => {
  console.log(`SSO server listening at http://localhost:${port}`);
});
