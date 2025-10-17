import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Создаём корневой элемент и рендерим приложение
const container = document.getElementById('root');
if (!container) {
  throw new Error('Не найден элемент root в index.html');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
