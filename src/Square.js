

import React from 'react';

function Square({ value, onClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? 'winning' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

export default Square;
