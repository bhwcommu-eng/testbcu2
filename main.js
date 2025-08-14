const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 150, y: 150, size: 16, color: "black" };
const otherPlayers = {};

document.addEventListener("keydown", (e) => {
  const step = 5;
  if(e.key === "ArrowUp") player.y -= step;
  if(e.key === "ArrowDown") player.y += step;
  if(e.key === "ArrowLeft") player.x -= step;
  if(e.key === "ArrowRight") player.x += step;
  // ส่งตำแหน่งไป server
  socket.emit("playerMovement", { x: player.x, y: player.y });
});

// รับผู้เล่นที่มีอยู่แล้ว
socket.on("currentPlayers", (players) => {
  for(let id in players){
    if(id !== socket.id) otherPlayers[id] = players[id];
  }
});

// เมื่อมีผู้เล่นใหม่
socket.on("newPlayer", (data) => { otherPlayers[data.id] = data; });

// เมื่อผู้เล่นขยับ
socket.on("playerMoved", (data) => { if(otherPlayers[data.id]){ otherPlayers[data.id].x = data.x; otherPlayers[data.id].y = data.y; } });

// เมื่อผู้เล่น disconnect
socket.on("playerDisconnected", (id) => { delete otherPlayers[id]; });

// วาดทุกอย่าง
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // วาดตัวเอง
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // วาดผู้เล่นอื่น
  for(let id in otherPlayers){
    const p = otherPlayers[id];
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  requestAnimationFrame(draw);
}
draw();
