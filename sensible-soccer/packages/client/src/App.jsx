import { useGameStore } from './store/gameStore.js';
import MainMenu from './components/MainMenu.jsx';
import Lobby from './components/Lobby.jsx';
import GameView from './components/GameView.jsx';

function App() {
  const screen = useGameStore(state => state.screen);

  return (
    <div className="game-container">
      {screen === 'menu' && <MainMenu />}
      {screen === 'lobby' && <Lobby />}
      {screen === 'game' && <GameView />}
    </div>
  );
}

export default App;
