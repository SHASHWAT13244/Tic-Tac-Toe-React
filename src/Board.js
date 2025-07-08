
import React from 'react';
import Square from './Square';

function Board({ squares, onClick, winningLine }) {
  const renderSquare = (i) => (
    <Square
      value={squares[i]}
      onClick={() => onClick(i)}
      isWinning={winningLine.includes(i)}
    />
  );

  return (
    <div className="board">
      {[0,1,2].map(row => (
        <div key={row} className="row">
          {renderSquare(row*3)}
          {renderSquare(row*3 + 1)}
          {renderSquare(row*3 + 2)}
        </div>
      ))}
    </div>
  );
}

export default Board;
