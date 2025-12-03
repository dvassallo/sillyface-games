import { useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import networkManager from '../network/NetworkManager.js';

function MainMenu() {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const startLocalGame = useGameStore(state => state.startLocalGame);
  const setPlayerName = useGameStore(state => state.setPlayerName);
  const setScreen = useGameStore(state => state.setScreen);

  const handleStartPractice = () => {
    setPlayerName(name || 'Player');
    startLocalGame();
  };

  const handleCreateLobby = async () => {
    const playerName = name || 'Player';
    setPlayerName(playerName);
    setConnecting(true);
    setError(null);

    try {
      await networkManager.connect();
      networkManager.createLobby(playerName);
      setScreen('lobby');
    } catch (err) {
      setError('Failed to connect to server. Is it running?');
      setConnecting(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a lobby code');
      return;
    }

    const playerName = name || 'Player';
    setPlayerName(playerName);
    setConnecting(true);
    setError(null);

    try {
      await networkManager.connect();
      networkManager.joinLobby(joinCode.trim(), playerName);
      setScreen('lobby');
    } catch (err) {
      setError('Failed to connect to server. Is it running?');
      setConnecting(false);
    }
  };

  return (
    <div className="menu-screen">
      <h1 className="menu-title">Sensible Soccer</h1>

      {error && (
        <div style={{
          background: '#ff4444',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 8,
          marginBottom: 20
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: '12px 20px',
            fontSize: 16,
            borderRadius: 8,
            border: 'none',
            background: '#2a2a4e',
            color: '#fff',
            width: 250,
            textAlign: 'center'
          }}
        />
      </div>

      <div className="menu-buttons">
        <button className="menu-button primary" onClick={handleStartPractice}>
          Practice Mode
        </button>

        <button
          className="menu-button secondary"
          onClick={handleCreateLobby}
          disabled={connecting}
        >
          {connecting ? 'Connecting...' : 'Create Lobby'}
        </button>

        {!showJoinInput ? (
          <button
            className="menu-button secondary"
            onClick={() => setShowJoinInput(true)}
          >
            Join Lobby
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="Enter code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                padding: '12px 20px',
                fontSize: 16,
                borderRadius: 8,
                border: 'none',
                background: '#2a2a4e',
                color: '#fff',
                width: 120,
                textAlign: 'center',
                fontFamily: 'monospace',
                letterSpacing: 4
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinLobby()}
              autoFocus
            />
            <button
              className="menu-button primary"
              onClick={handleJoinLobby}
              disabled={connecting}
              style={{ padding: '12px 20px' }}
            >
              Join
            </button>
            <button
              className="menu-button secondary"
              onClick={() => {
                setShowJoinInput(false);
                setJoinCode('');
              }}
              style={{ padding: '12px 20px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="instructions">
        <strong>Controls:</strong>{' '}
        <kbd>Arrow Keys</kbd> to move |{' '}
        <kbd>Space</kbd> to kick (hold to charge) |{' '}
        <kbd>Shift</kbd> to sprint |{' '}
        <kbd>X</kbd> to tackle
      </div>
    </div>
  );
}

export default MainMenu;
