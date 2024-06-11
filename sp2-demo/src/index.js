const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 5000;

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
  console.log(`App2 listening at http://localhost:${port}`);
});
