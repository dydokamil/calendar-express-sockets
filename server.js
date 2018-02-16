const express = require("express");
var cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const db = require("./config/db");

const app = express();

const port = 8000;

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(db.url, (err, database) => {
  if (err) return console.log(err);

  let server = app.listen(port, () => {
    console.log("We are live on " + port);
  });

  let sockets = new Set();
  const io = require("socket.io").listen(server);

  io.on("connection", socket => {
    console.log(`a user has connected: ${socket.id}`);
    sockets.add(socket.id);
    socket.on("message", event => {
      console.log(event);
    });
    console.log(`${sockets.size} users currently connected`);

    io.emit("usersLength", sockets.size);

    socket.on("disconnect", () => {
      sockets.delete(socket.id);
      io.emit("usersLength", sockets.size);
      console.log(`${sockets.size} users currently connected`);
    });
  });
  require("./app/routes")(app, database, io);
});
