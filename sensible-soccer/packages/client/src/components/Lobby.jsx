import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import networkManager from '../network/NetworkManager.js';

function Lobby() {
  const setScreen = useGameStore(state => state.setScreen);
  const playerName = useGameStore(state => state.playerName);
  const setLocalPlayerId = useGameStore(state => state.setLocalPlayerId);

  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set up message handlers
    const handleLobbyCreated = (msg) => {
      setLobby(msg.lobby);
      setError(null);
    };

    const handleLobbyJoined = (msg) => {
      setLobby(msg.lobby);
      setError(null);
    };

    const handlePlayerJoined = (msg) => {
      setLobby(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: [...prev.players, msg.player]
        };
      });
    };

    const handlePlayerLeft = (msg) => {
      setLobby(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter(p => p.id !== msg.playerId)
        };
      });
    };

    const handleLobbyState = (msg) => {
      setLobby(msg.lobby);
    };

    const handleError = (msg) => {
      setError(msg.message || 'An error occurred');
    };

    const handleMatchStart = (msg) => {
      setLocalPlayerId(msg.playerId);
      setScreen('game');
    };

    networkManager.on('lobby_created', handleLobbyCreated);
    networkManager.on('lobby_joined', handleLobbyJoined);
    networkManager.on('player_joined', handlePlayerJoined);
    networkManager.on('player_left', handlePlayerLeft);
    networkManager.on('lobby_state', handleLobbyState);
    networkManager.on('error', handleError);
    networkManager.on('match_start', handleMatchStart);

    return () => {
      networkManager.off('lobby_created', handleLobbyCreated);
      networkManager.off('lobby_joined', handleLobbyJoined);
      networkManager.off('player_joined', handlePlayerJoined);
      networkManager.off('player_left', handlePlayerLeft);
      networkManager.off('lobby_state', handleLobbyState);
      networkManager.off('error', handleError);
      networkManager.off('match_start', handleMatchStart);
    };
  }, [setScreen, setLocalPlayerId]);

  const handleSelectTeam = (team) => {
    setMyTeam(team);
    networkManager.selectTeam(team);
  };

  const handleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    networkManager.setReady(newReady);
  };

  const handleStartMatch = () => {
    networkManager.startMatch();
  };

  const handleBack = () => {
    networkManager.leaveLobby();
    networkManager.disconnect();
    setScreen('menu');
  };

  const isHost = lobby && lobby.hostId === networkManager.clientId;
  const allReady = lobby && lobby.players.length >= 2 && lobby.players.every(p => p.ready && p.team);

  return (
    <div className="menu-screen">
      <h1 className="menu-title">Game Lobby</h1>

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

      {lobby && (
        <>
          <div style={{
            background: '#2a2a4e',
            padding: '20px 40px',
            borderRadius: 12,
            marginBottom: 20
          }}>
            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 5 }}>
              Share this code with your friend:
            </div>
            <div style={{
              fontSize: 36,
              fontWeight: 'bold',
              letterSpacing: 8,
              fontFamily: 'monospace'
            }}>
              {lobby.code}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 40,
            marginBottom: 30
          }}>
            {/* Home Team */}
            <div style={{
              background: myTeam === 'home' ? '#ff444455' : '#1a1a3e',
              border: myTeam === 'home' ? '2px solid #ff4444' : '2px solid transparent',
              borderRadius: 12,
              padding: 20,
              minWidth: 200,
              cursor: 'pointer'
            }} onClick={() => handleSelectTeam('home')}>
              <h3 style={{ color: '#ff4444', margin: '0 0 15px 0' }}>Home Team</h3>
              {lobby.players.filter(p => p.team === 'home').map(p => (
                <div key={p.id} style={{
                  padding: '5px 10px',
                  background: '#ff444433',
                  borderRadius: 4,
                  marginBottom: 5
                }}>
                  {p.name} {p.ready && '✓'}
                </div>
              ))}
            </div>

            {/* Away Team */}
            <div style={{
              background: myTeam === 'away' ? '#4444ff55' : '#1a1a3e',
              border: myTeam === 'away' ? '2px solid #4444ff' : '2px solid transparent',
              borderRadius: 12,
              padding: 20,
              minWidth: 200,
              cursor: 'pointer'
            }} onClick={() => handleSelectTeam('away')}>
              <h3 style={{ color: '#4444ff', margin: '0 0 15px 0' }}>Away Team</h3>
              {lobby.players.filter(p => p.team === 'away').map(p => (
                <div key={p.id} style={{
                  padding: '5px 10px',
                  background: '#4444ff33',
                  borderRadius: 4,
                  marginBottom: 5
                }}>
                  {p.name} {p.ready && '✓'}
                </div>
              ))}
            </div>
          </div>

          {/* Unassigned players */}
          {lobby.players.some(p => !p.team) && (
            <div style={{ marginBottom: 20, opacity: 0.7 }}>
              <div>Waiting to pick team:</div>
              {lobby.players.filter(p => !p.team).map(p => (
                <span key={p.id} style={{ marginRight: 10 }}>{p.name}</span>
              ))}
            </div>
          )}

          <div className="menu-buttons">
            {myTeam && (
              <button
                className={`menu-button ${isReady ? 'primary' : 'secondary'}`}
                onClick={handleReady}
              >
                {isReady ? '✓ Ready!' : 'Click when Ready'}
              </button>
            )}

            {isHost && allReady && (
              <button className="menu-button primary" onClick={handleStartMatch}>
                Start Match
              </button>
            )}

            <button className="menu-button secondary" onClick={handleBack}>
              Back to Menu
            </button>
          </div>

          <div style={{ marginTop: 20, opacity: 0.6, fontSize: 14 }}>
            {lobby.players.length} player{lobby.players.length !== 1 ? 's' : ''} in lobby
            {!allReady && lobby.players.length >= 2 && ' - Waiting for all players to select team and ready up'}
            {lobby.players.length < 2 && ' - Waiting for another player to join'}
          </div>
        </>
      )}

      {!lobby && (
        <div style={{ opacity: 0.7 }}>
          Connecting to lobby...
        </div>
      )}
    </div>
  );
}

export default Lobby;
