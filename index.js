const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "build"), {
   setHeaders: function(res, path) {
     res.set("Access-Control-Allow-Origin", "*");
     res.set("Access-Control-Allow-Headers", "X-Requested-With, content-type, Authorization");
     res.set("Access-Control-Allow-Methods","GET");
   }
   }));


app.listen(PORT, () => {
   console.log("Server Started on Port ", PORT);
});