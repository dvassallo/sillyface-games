import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import pino from 'pino';
import { GameRoom } from './game/GameRoom.js';
import { LobbyManager } from './matchmaking/LobbyManager.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const PORT = process.env.PORT || 8080;

// Create Express app for health checks
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize lobby manager
const lobbyManager = new LobbyManager();

// Active game rooms
const gameRooms = new Map();

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  logger.info({ clientId }, 'Client connected');

  ws.clientId = clientId;
  ws.isAlive = true;

  // Send client their ID immediately
  ws.send(JSON.stringify({ type: 'connected', clientId }));

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      handleMessage(ws, data);
    } catch (err) {
      logger.error({ err, clientId }, 'Error handling message');
    }
  });

  ws.on('close', () => {
    logger.info({ clientId }, 'Client disconnected');
    handleDisconnect(ws);
  });

  ws.on('error', (err) => {
    logger.error({ err, clientId }, 'WebSocket error');
  });
});

// Heartbeat to detect dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

function handleMessage(ws, data) {
  const message = JSON.parse(data.toString());
  logger.debug({ message, clientId: ws.clientId }, 'Received message');

  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'create_lobby': {
      const lobby = lobbyManager.createLobby(ws.clientId, message.settings);
      ws.lobbyId = lobby.id;
      ws.send(JSON.stringify({ type: 'lobby_created', lobby }));
      break;
    }

    case 'join_lobby': {
      const result = lobbyManager.joinLobby(message.code, ws.clientId, message.name);
      if (result.success) {
        ws.lobbyId = result.lobby.id;
        ws.send(JSON.stringify({ type: 'lobby_joined', lobby: result.lobby }));
        // Notify other players
        broadcastToLobby(result.lobby.id, {
          type: 'player_joined',
          player: { id: ws.clientId, name: message.name }
        }, ws.clientId);
      } else {
        ws.send(JSON.stringify({ type: 'error', message: result.error }));
      }
      break;
    }

    case 'leave_lobby': {
      if (ws.lobbyId) {
        lobbyManager.leaveLobby(ws.lobbyId, ws.clientId);
        broadcastToLobby(ws.lobbyId, {
          type: 'player_left',
          playerId: ws.clientId
        });
        ws.lobbyId = null;
      }
      break;
    }

    case 'select_team': {
      if (!ws.lobbyId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not in a lobby' }));
        break;
      }
      const success = lobbyManager.setPlayerTeam(ws.lobbyId, ws.clientId, message.team);
      if (success) {
        const lobby = lobbyManager.getLobby(ws.lobbyId);
        broadcastToLobby(ws.lobbyId, { type: 'lobby_state', lobby });
      } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Could not select team' }));
      }
      break;
    }

    case 'ready': {
      if (!ws.lobbyId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not in a lobby' }));
        break;
      }
      lobbyManager.setPlayerReady(ws.lobbyId, ws.clientId, message.ready);
      const lobby = lobbyManager.getLobby(ws.lobbyId);
      broadcastToLobby(ws.lobbyId, { type: 'lobby_state', lobby });
      break;
    }

    case 'start_match': {
      if (!ws.lobbyId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not in a lobby' }));
        break;
      }
      const lobby = lobbyManager.getLobby(ws.lobbyId);
      if (!lobby || lobby.hostId !== ws.clientId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Only host can start' }));
        break;
      }
      if (!lobbyManager.canStartGame(ws.lobbyId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Not all players ready' }));
        break;
      }

      // Create game room
      const gameRoom = new GameRoom(ws.lobbyId, lobby.settings);
      gameRooms.set(ws.lobbyId, gameRoom);

      // Add all players to game room
      for (const player of lobby.players) {
        const playerWs = findClientById(player.id);
        if (playerWs) {
          gameRoom.addPlayer(player.id, playerWs, player.team, player.name);
          playerWs.gameRoomId = ws.lobbyId;
        }
      }

      // Start the game
      lobbyManager.startGame(ws.lobbyId);
      gameRoom.start();

      // Notify all players
      for (const player of lobby.players) {
        const playerWs = findClientById(player.id);
        if (playerWs) {
          playerWs.send(JSON.stringify({
            type: 'match_start',
            playerId: player.id,
            team: player.team
          }));
        }
      }
      break;
    }

    case 'input': {
      if (!ws.gameRoomId) break;
      const gameRoom = gameRooms.get(ws.gameRoomId);
      if (gameRoom) {
        gameRoom.processInput(ws.clientId, message);
      }
      break;
    }

    default:
      logger.warn({ type: message.type }, 'Unknown message type');
  }
}

function findClientById(clientId) {
  for (const client of wss.clients) {
    if (client.clientId === clientId) {
      return client;
    }
  }
  return null;
}

function handleDisconnect(ws) {
  if (ws.lobbyId) {
    lobbyManager.leaveLobby(ws.lobbyId, ws.clientId);
    broadcastToLobby(ws.lobbyId, {
      type: 'player_left',
      playerId: ws.clientId
    });
  }
}

function broadcastToLobby(lobbyId, message, excludeClientId = null) {
  const lobby = lobbyManager.getLobby(lobbyId);
  if (!lobby) return;

  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.lobbyId === lobbyId && client.clientId !== excludeClientId) {
      client.send(data);
    }
  });
}

function generateClientId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

server.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
