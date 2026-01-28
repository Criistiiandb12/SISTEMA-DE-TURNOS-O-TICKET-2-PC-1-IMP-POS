const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let turnoActual = 0;
let colaTurnos = [];

// ---------- SOCKET.IO ---------- //
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar estado inicial
  socket.emit("estado_turnos", colaTurnos);

  socket.on("nuevo_turno", (callback) => {
  turnoActual++;
  const turno = `T${turnoActual.toString().padStart(3, "0")}`;
  colaTurnos.push(turno);

  io.emit("estado_turnos", colaTurnos);

  callback(turno); 

// Resetea los turnos a medianoche
  function resetDiario() {
  turnoActual = 0;
  colaTurnos = [];
  io.emit("estado_turnos", colaTurnos);
  io.emit("turno_llamado", null);
  console.log("🔄 Turnos reseteados automáticamente");
}

// Revisa cada minuto
setInterval(() => {
  const ahora = new Date();
  if (ahora.getHours() === 0 && ahora.getMinutes() === 0) {
    resetDiario();
  }
}, 60000);

});


  socket.on("llamar_siguiente", () => {
    if (colaTurnos.length === 0) return;

    const llamado = colaTurnos.shift();
    io.emit("turno_llamado", llamado);
    io.emit("estado_turnos", colaTurnos);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

/* ---------- RUTAS ---------- */

// Página del kiosco para solicitar turnos
app.get("/kiosco", (req, res) => {
  res.sendFile(__dirname + "/public/kiosco.html");
});

// Página de administración para llamar turnos
app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

// Página de visualización de turnos llamados
app.get("/display", (req, res) => {
  res.sendFile(__dirname + "/public/display.html");
});


/* ---------- SERVIDOR ---------- */
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor LAN activo en http://localhost:${PORT}`);
});
