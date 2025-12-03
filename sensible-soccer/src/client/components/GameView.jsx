import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import Game from '../game/Game.js';
import MultiplayerGame from '../game/MultiplayerGame.js';
import GameHUD from './GameHUD.jsx';
import networkManager from '../network/NetworkManager.js';

function GameView() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const initializingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateGameState = useGameStore(state => state.updateGameState);
  const localPlayerId = useGameStore(state => state.localPlayerId);

  // Determine if this is a multiplayer game
  const isMultiplayer = networkManager.connected && localPlayerId;

  useEffect(() => {
    // Prevent double initialization
    if (initializingRef.current || gameRef.current) return;
    if (!containerRef.current) return;

    initializingRef.current = true;

    // Initialize appropriate game type
    const GameClass = isMultiplayer ? MultiplayerGame : Game;
    const game = new GameClass({
      container: containerRef.current,
      onStateUpdate: updateGameState,
      localPlayerId: localPlayerId
    });

    gameRef.current = game;

    game.init()
      .then(() => {
        // Check if game was destroyed during init
        if (game.destroyed) return;

        setLoading(false);
        game.start();
      })
      .catch(err => {
        console.error('Failed to initialize game:', err);
        setError(err.message);
        setLoading(false);
      });

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [updateGameState, isMultiplayer, localPlayerId]);

  if (error) {
    return (
      <div className="menu-screen">
        <h2 style={{ color: '#ff4444' }}>Error loading game</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          <span>Loading game...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="canvas-container"
        style={{ display: loading ? 'none' : 'block' }}
      />
      {!loading && <GameHUD />}
    </>
  );
}

export default GameView;
