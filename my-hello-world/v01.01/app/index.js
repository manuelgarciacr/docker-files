// Exemple 1: Hola món bàsic
console.log("Hola des de Docker! argument:", process.argv[2] || "sense argument");
// Exemple 2 (opcional): Servidor web amb Express
const express = require("express");
const app = express();
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor escoltant en http://localhost:${PORT}`);
});

["SIGINT", "SIGTERM"]
.forEach(signal => process.on(signal, () => {
    console.log(`Recibido ${signal}`);
    server.close(() => {
        console.log("Servidor detenido");
        process.exit(0);
    })
}));

app.get("/", (req, res) => {
    res.send("Hola món des de un contenidor Docker!\n");
});
