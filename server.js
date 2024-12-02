const fs = require("fs");
const os = require("os");
const https = require("https");
const privateKey = fs.readFileSync("example.com+6-key.pem");
const certificate = fs.readFileSync("example.com+6.pem");
// app
const express = require("express");
const app = express();
// middleware - add headers for opfs
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
})
// serving static assets from the "public" directory
app.use(express.static(__dirname + "/public"))
// route handler
app.get("/", (req, res) => {
  res.sendfile(__dirname + "/index.html");
});
// starting the server
const PORT = 5000;
https
  .createServer({ key: privateKey, cert: certificate }, app)
  .listen(PORT, () => {
    // console.log(os.networkInterfaces()?.Ethernet[1].address)
    console.log(`Server is running on port \n\thttps://localhost:${PORT}`);
    console.log(`\thttps://${os.networkInterfaces()?.Ethernet[1].address}:${PORT}`);
  });