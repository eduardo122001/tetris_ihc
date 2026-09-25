const express = require('express');
const app = express();

// Permite procesar los datos JSON que envía la placa ESP
app.use(express.json());

// Sirve tu archivo index.html y tus carpetas de assets
app.use(express.static(__dirname));

let clientesConectados = [];

// 1. La placa ESP envía los datos aquí (POST)
app.post('/datos', (req, res) => {
    console.log("📡 Datos del MCU recibidos:", req.body); // Imprime en la terminal del Mac
    
    // Reenvía los datos al HTML al instante
    clientesConectados.forEach(cliente => {
        cliente.res.write(`data: ${JSON.stringify(req.body)}\n\n`);
    });
    
    res.sendStatus(200);
});

// 2. Tu HTML se conecta aquí para escuchar los datos (GET)
app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    clientesConectados.push({ res });
    
    req.on('close', () => {
        clientesConectados = clientesConectados.filter(c => c.res !== res);
    });
});

// Iniciar servidor en el puerto 8080 para todas las IPs de tu red
app.listen(8080, '0.0.0.0', () => {
    console.log(' Servidor listo.');
    console.log(' Abre tu juego en: http://localhost:8080');
    console.log(' La placa ESP debe enviar datos a: http://10.92.127.220:8080/datos');
});