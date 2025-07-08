
import React, { useState, useEffect } from 'react';
import './index.css';

const themes = ['default', 'neon', 'sketch', 'earth', 'cyber'];

function useSound() {
  const ctxRef = React.useRef(null);

  const play = (freq) => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  return {
    playMove: () => play(600),
    playWin: () => {
      play(400);
      setTimeout(() => play(600), 150);
      setTimeout(() => play(800), 300);
    }
  };
}

function Board({ squares, onClick, winningLine }) {
  return (
    <div className="board">
      {squares.map((val, i) => {
        const isWinning = winningLine.includes(i);
        return (
          <button
            key={i}
            className={`square ${val || ''} ${isWinning ? 'winning' : ''}`}
            onClick={() => onClick(i)}
          >
            {val}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'local'
  const [theme, setTheme] = useState('default');

  const { playMove, playWin } = useSound();
  const currentSquares = history[step];
  const { winner, line } = calculateWinner(currentSquares);

  useEffect(() => {
    if (winner) {
      playWin();
      setScore(s => ({ ...s, [winner]: s[winner] + 1 }));
    }
  }, [winner]);

  useEffect(() => {
    if (!winner && mode === 'single' && !isXNext) {
      const move = getBestMove(currentSquares);
      if (move !== -1) {
        setTimeout(() => handleClick(move), 500);
      }
    }
  }, [isXNext, step, mode, winner]);

  const handleClick = (i) => {
    if (currentSquares[i] || winner) return;

    const next = currentSquares.slice();
    next[i] = isXNext ? 'X' : 'O';

    const newHistory = history.slice(0, step + 1);
    setHistory([...newHistory, next]);
    setStep(newHistory.length);
    setIsXNext(!isXNext);
    playMove();
  };

  const restartGame = () => {
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setIsXNext(true);
    const newTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(newTheme);
  };

  const undoMove = () => {
    if (step === 0) return;
    setStep(step - 1);
    setIsXNext((step - 1) % 2 === 0);
  };

  const status = winner
    ? `Winner: ${winner}`
    : currentSquares.includes(null)
    ? `Next Player: ${isXNext ? 'X' : 'O'}`
    : 'Draw!';

  return (
    <div className={`game ${darkMode ? 'dark' : ''} theme-${theme}`}>
      <h1>Tic-Tac-Toe</h1>
      <p className="status">{status}</p>

      <Board squares={currentSquares} onClick={handleClick} winningLine={line} />

      <div className="controls">
        <button onClick={undoMove} disabled={step === 0}>Undo</button>
        <button onClick={restartGame}>Restart</button>
        <button onClick={() => setDarkMode(d => !d)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="scoreboard">X: {score.X} | O: {score.O}</div>

      <div className="selectors">
        <label>
          Mode:
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="single">Single Player</option>
            <option value="local">Local Multiplayer</option>
          </select>
        </label>

        <label>
          Theme:
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            {themes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function calculateWinner(sq) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of lines) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return { winner: sq[a], line: [a,b,c] };
    }
  }
  return { winner: null, line: [] };
}

function getBestMove(squares) {
  const best = minimax(squares, 'O');
  return best.index;
}

function minimax(newBoard, player) {
  const availSpots = newBoard
    .map((v, i) => (v ? null : i))
    .filter(i => i !== null);

  const winner = calculateWinner(newBoard).winner;
  if (winner === 'X') return { score: -10 };
  if (winner === 'O') return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i of availSpots) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
    move.score = result.score;

    newBoard[i] = null;
    moves.push(move);
  }

  if (player === 'O') {
    return moves.reduce((best, move) => (move.score > best.score ? move : best), { score: -Infinity });
  } else {
    return moves.reduce((best, move) => (move.score < best.score ? move : best), { score: Infinity });
  }
}
