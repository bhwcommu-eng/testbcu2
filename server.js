const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("ผู้เล่นเชื่อมต่อ:", socket.id);
  // สร้าง player ใหม่
  players[socket.id] = { x: 150, y: 150, color: getRandomColor() };

  // ส่งผู้เล่นทั้งหมดไปยังคนใหม่
  socket.emit("currentPlayers", players);

  // แจ้งผู้เล่นคนอื่น
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  // รับ movement จาก client
  socket.on("playerMovement", (data) => {
    if(players[socket.id]){
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      socket.broadcast.emit("playerMoved", { id: socket.id, x: data.x, y: data.y });
    }
  });

  // ตัดการเชื่อมต่อ
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

function getRandomColor(){
  const colors = ["red","blue","green","yellow","purple","orange"];
  return colors[Math.floor(Math.random()*colors.length)];
}

http.listen(3000, () => console.log("Server running on port 3000"));
