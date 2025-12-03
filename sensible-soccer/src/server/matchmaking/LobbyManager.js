import { nanoid } from 'nanoid';

export class LobbyManager {
  constructor() {
    this.lobbies = new Map();
  }

  createLobby(hostId, settings = {}) {
    const id = nanoid(10);
    const code = this.generateCode();

    const lobby = {
      id,
      code,
      hostId,
      settings: {
        teamSize: settings.teamSize || 1,
        matchDuration: settings.matchDuration || 180,
        isPrivate: settings.isPrivate !== false,
        ...settings
      },
      players: [{
        id: hostId,
        name: settings.hostName || 'Host',
        team: null,
        ready: false
      }],
      state: 'waiting', // waiting, starting, in_game
      createdAt: Date.now()
    };

    this.lobbies.set(id, lobby);
    return lobby;
  }

  joinLobby(code, playerId, name) {
    // Find lobby by code
    let lobby = null;
    for (const l of this.lobbies.values()) {
      if (l.code === code) {
        lobby = l;
        break;
      }
    }

    if (!lobby) {
      return { success: false, error: 'Lobby not found' };
    }

    if (lobby.state !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    const maxPlayers = lobby.settings.teamSize * 2;
    if (lobby.players.length >= maxPlayers) {
      return { success: false, error: 'Lobby is full' };
    }

    // Check if player already in lobby
    if (lobby.players.find(p => p.id === playerId)) {
      return { success: false, error: 'Already in lobby' };
    }

    lobby.players.push({
      id: playerId,
      name: name || 'Player',
      team: null,
      ready: false
    });

    return { success: true, lobby };
  }

  leaveLobby(lobbyId, playerId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    lobby.players = lobby.players.filter(p => p.id !== playerId);

    // If host left, assign new host or delete lobby
    if (lobby.hostId === playerId) {
      if (lobby.players.length > 0) {
        lobby.hostId = lobby.players[0].id;
      } else {
        this.lobbies.delete(lobbyId);
      }
    }
  }

  getLobby(lobbyId) {
    return this.lobbies.get(lobbyId);
  }

  getLobbyByCode(code) {
    for (const lobby of this.lobbies.values()) {
      if (lobby.code === code) {
        return lobby;
      }
    }
    return null;
  }

  setPlayerTeam(lobbyId, playerId, team) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;

    const player = lobby.players.find(p => p.id === playerId);
    if (!player) return false;

    // Check team capacity
    const teamCount = lobby.players.filter(p => p.team === team).length;
    if (teamCount >= lobby.settings.teamSize) {
      return false;
    }

    player.team = team;
    return true;
  }

  setPlayerReady(lobbyId, playerId, ready) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;

    const player = lobby.players.find(p => p.id === playerId);
    if (!player) return false;

    player.ready = ready;
    return true;
  }

  canStartGame(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;

    // All players must be ready and on a team
    return lobby.players.every(p => p.ready && p.team);
  }

  startGame(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    if (!this.canStartGame(lobbyId)) {
      return null;
    }

    lobby.state = 'in_game';
    return lobby;
  }

  generateCode() {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // Cleanup old lobbies
  cleanup(maxAgeMs = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [id, lobby] of this.lobbies) {
      if (now - lobby.createdAt > maxAgeMs && lobby.state === 'waiting') {
        this.lobbies.delete(id);
      }
    }
  }
}
