"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');

var http = require('http');

var _require = require('socket.io'),
    Server = _require.Server;

var cors = require('cors'); // 1. Configuration


var PORT = process.env.PORT || 5000;
var ALLOWED_ORIGINS = ['http://localhost:3000', // Next.js local
'https://ton-nextjs-client.vercel.app', // ton Next.js en prod
'https://api-ansd.ansdesignprint.com' // optionnel : ton domaine Flutter web
]; // 2. Initialisation

var app = express();
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST"]
}));
var server = http.createServer(app);
var io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
}); // 3. Routes API simples

app.get('/', function (req, res) {
  res.send('✅ Serveur Socket.IO en ligne');
});
app.post('/send-message', express.json(), function (req, res) {
  var _req$body = req.body,
      message = _req$body.message,
      url = _req$body.url;

  if (!message && !url) {
    return res.status(400).json({
      error: 'Message manquant'
    });
  }

  io.emit('receive_message', {
    message: message
  });
  console.log('📨 Message envoyé:', message);
  console.log('📨 BASE URL :', url);
  return res.json({
    success: true,
    message: 'message envoyer avec success',
    contenu: req.body.message
  });
});
app.post('/devis-notification', express.json(), function (req, res) {
  //const { type, message, user, devis } = req.body;
  var data = req.body;

  if (!data) {
    return res.status(400).json({
      error: 'Message manquant'
    });
  }

  io.emit('receive_message', _objectSpread({}, data));
  console.log('📨 Message envoyé:', data);
  return res.json({
    success: true,
    message: 'message envoyer avec success',
    contenu: _objectSpread({}, data)
  });
}); // 4. Événements WebSocket

io.on('connection', function (socket) {
  console.log('✅ Nouveau client connecté:', socket.id);
  socket.on('send_message', function (data) {
    console.log('💬 Message reçu via WebSocket:', data);
    io.emit('receive_message', data);
  });
  socket.on('disconnect', function () {
    console.log('❌ Client déconnecté:', socket.id);
  });
}); // 5. Lancement du serveur

server.listen(PORT, function () {
  console.log("\uD83D\uDE80 Serveur Socket.IO d\xE9marr\xE9 sur le port ".concat(PORT, " ou ").concat(process.env.PORT, " "));
});