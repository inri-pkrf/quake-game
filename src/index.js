import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const render = () => createRoot(document.getElementById('root')).render(<App />);
// מחכים לפונטים (עד 2.5 שניות) כדי שלא יהיה הבהוב של פונט אחר בכותרות
const f = document.fonts;
if (f && f.load) {
  Promise.race([
    Promise.all([f.load('700 100px Karantina', 'החלטה'), f.load('700 100px Karantina', '10:42'), f.load('600 40px Assistant', 'שלום 10')]),
    new Promise(r => setTimeout(r, 2500))
  ]).then(render, render);
} else render();
