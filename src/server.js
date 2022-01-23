import express from "express";
import http from "http";
import socketIo from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app);
const io = socketIo(httpServer);

function publicRooms(){
  const {sockets:{adapter:{rooms, sids}}} = io;
  const publicRooms = [];
  rooms.forEach((_, k) => {
    if(sids.get(k) === undefined) publicRooms.push(k);
  })
  return publicRooms;
}

function countUsers(roomName){
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket.on("enterRoom", (roomName, done) => {
    socket.join(roomName);
    socket.to(roomName).emit("someoneEnter", socket.nickname, countUsers(roomName));
    if (countUsers(roomName) === 3){
      socket.to(roomName).emit("gameStart");
    }
    io.sockets.emit("roomChange", publicRooms());
    done();
  })
  socket.on("sendMessage", (msg, room) => {
    socket.to(room).emit("sendMessage", msg, socket.nickname);
  })
  socket.on("getNickname", (nickname) => {
    socket.nickname = nickname;
  })
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countUsers(room) - 1);
    });
  })
  socket.on("disconnect", () => {
    io.sockets.emit("roomChange", publicRooms());
  })
})

httpServer.listen(3000);