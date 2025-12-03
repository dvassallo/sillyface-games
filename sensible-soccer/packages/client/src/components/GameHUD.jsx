import { useGameStore } from '../store/gameStore.js';

function GameHUD() {
  const score = useGameStore(state => state.score);
  const clock = useGameStore(state => state.clock);

  // Format clock as MM:SS
  const formatClock = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="hud">
        <div className="score">
          <span className="home">{score.home}</span>
          {' - '}
          <span className="away">{score.away}</span>
        </div>
        <div className="clock">{formatClock(clock)}</div>
      </div>
      <div className="controls-help">
        <div><kbd>Arrows</kbd> Move</div>
        <div><kbd>Space</kbd> Kick (hold to charge)</div>
        <div><kbd>X</kbd> Tackle</div>
        <div><kbd>Shift</kbd> Sprint</div>
      </div>
    </>
  );
}

export default GameHUD;
