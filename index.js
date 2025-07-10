const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 1. Configuration
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = [
  'http://localhost:3000',             // Next.js local
  'https://ton-nextjs-client.vercel.app',  // ton Next.js en prod
  'https://api-ansd.ansdesignprint.com'               // optionnel : ton domaine Flutter web
];

// 2. Initialisation
const app = express();
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// 3. Routes API simples
app.get('/', (req, res) => {
  res.send('✅ Serveur Socket.IO en ligne');
});

app.post('/send-message', express.json(), (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message manquant' });
  }

  io.emit('receive_message', { message });
  console.log('📨 Message envoyé:', message);

  return res.json({ success: true });
});

// 4. Événements WebSocket
io.on('connection', (socket) => {
  console.log('✅ Nouveau client connecté:', socket.id);

  socket.on('send_message', (data) => {
    console.log('💬 Message reçu via WebSocket:', data);
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté:', socket.id);
  });
});

// 5. Lancement du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
});