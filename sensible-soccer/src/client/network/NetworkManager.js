// WebSocket connection manager for multiplayer

class NetworkManager {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.clientId = null;
    this.lobbyId = null;
    this.handlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url = null) {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // Default to same host, port 8080 for dev
      const wsUrl = url || this.getWebSocketUrl();
      console.log('Connecting to', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };
    });
  }

  getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In development, use port 8080 for server
    const host = window.location.hostname;
    const port = import.meta.env.DEV ? 8080 : window.location.port;
    return `${protocol}//${host}:${port}`;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.clientId = null;
    this.lobbyId = null;
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Attempting reconnect in ${delay}ms...`);

    setTimeout(() => {
      this.connect().catch(() => {});
    }, delay);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send - not connected');
    }
  }

  handleMessage(message) {
    console.log('Received:', message.type, message);

    // Handle specific message types
    switch (message.type) {
      case 'connected':
        this.clientId = message.clientId;
        console.log('My client ID:', this.clientId);
        break;
      case 'lobby_created':
        this.lobbyId = message.lobby.id;
        break;
      case 'lobby_joined':
        this.lobbyId = message.lobby.id;
        break;
    }

    // Emit to registered handlers
    this.emit(message.type, message);
  }

  // Event handling
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.handlers.has(event)) return;
    const handlers = this.handlers.get(event);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.handlers.has(event)) return;
    for (const handler of this.handlers.get(event)) {
      handler(data);
    }
  }

  // Lobby methods
  createLobby(hostName) {
    this.send({
      type: 'create_lobby',
      settings: { hostName, teamSize: 1 }
    });
  }

  joinLobby(code, name) {
    this.send({
      type: 'join_lobby',
      code: code.toUpperCase(),
      name
    });
  }

  leaveLobby() {
    this.send({ type: 'leave_lobby' });
    this.lobbyId = null;
  }

  selectTeam(team) {
    this.send({
      type: 'select_team',
      team
    });
  }

  setReady(ready) {
    this.send({
      type: 'ready',
      ready
    });
  }

  startMatch() {
    this.send({ type: 'start_match' });
  }

  // Game input
  sendInput(input) {
    this.send({
      type: 'input',
      ...input
    });
  }

  ping() {
    this.send({ type: 'ping' });
  }
}

// Singleton instance
export const networkManager = new NetworkManager();
export default networkManager;
