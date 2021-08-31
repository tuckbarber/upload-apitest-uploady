const express = require("express");
const fileUpload = require("express-fileupload");

const app = express();
app.use(fileUpload());

app.get("/", (req, res) => {
  res.end("[SERVER] Server is running...");
});

app.get("/api", (req, res) => {
  res.end("[SERVER] Here is a response");
});

app.post("/api/upload", (req, res) => {
  const file = req.files.file;
  console.log(`[SERVER] Uploaded file ${file.name}`);
  res.status(200).end(JSON.stringify({ name: file.name }));
});

app.listen(3030, function () {
  console.log("Server is running on 3030");
});
