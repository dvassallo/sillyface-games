import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Note: StrictMode removed because PixiJS doesn't handle
// double mount/unmount cycles well in development
createRoot(document.getElementById('root')).render(<App />);
