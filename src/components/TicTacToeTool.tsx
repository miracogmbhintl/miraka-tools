import { useState } from 'react';
import { RotateCcw, Trophy, Users } from 'lucide-react';
import '../styles/global.css';

type Player = 'X' | 'O' | null;

export default function TicTacToeTool() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    // Check for winner or draw
    const newWinner = calculateWinner(newBoard);
    const newIsDraw = !newWinner && newBoard.every(cell => cell !== null);
    
    if (newWinner || newIsDraw) {
      setGameOver(true);
      setTimeout(() => {
        if (newWinner) {
          setScores(prev => ({
            ...prev,
            [newWinner]: prev[newWinner] + 1
          }));
        } else {
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
      }, 500);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const getStatus = () => {
    if (winner) {
      return `Winner: Player ${winner}!`;
    } else if (isDraw) {
      return "It's a Draw!";
    } else {
      return `Current Player: ${isXNext ? 'X' : 'O'}`;
    }
  };

  const getWinningLine = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c];
      }
    }
    return [];
  };

  const winningLine = getWinningLine();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Tic Tac Toe</h1>
          <p className="text-muted-foreground">Classic game for two players</p>
        </div>

        {/* Scoreboard */}
        <div className="bg-card border-[5px] border-black p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Scoreboard</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">X</div>
              <div className="text-3xl font-bold">{scores.X}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-muted-foreground">Draw</div>
              <div className="text-3xl font-bold">{scores.draws}</div>
              <div className="text-sm text-muted-foreground">Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">O</div>
              <div className="text-3xl font-bold">{scores.O}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-card border-[5px] border-black p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-lg font-semibold">{getStatus()}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-card border-[5px] border-black p-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner || gameOver}
                className={`
                  aspect-square bg-background border-[3px] border-black
                  text-5xl font-bold
                  hover:bg-accent transition-colors
                  disabled:cursor-not-allowed
                  ${cell === 'X' ? 'text-primary' : ''}
                  ${cell === 'O' ? 'text-primary' : ''}
                  ${winningLine.includes(index) ? 'bg-primary/20' : ''}
                `}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors border-[3px] border-black flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </button>
          <button
            onClick={resetScores}
            className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 font-semibold hover:bg-secondary/90 transition-colors border-[3px] border-black"
          >
            Reset Scores
          </button>
        </div>

        {/* Game Rules */}
        <div className="mt-8 bg-card border-[5px] border-black p-6">
          <h3 className="font-semibold mb-3 text-lg">How to Play</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Players take turns placing X and O on the grid</li>
            <li>• First player to get 3 in a row wins (horizontal, vertical, or diagonal)</li>
            <li>• If all 9 squares are filled with no winner, it's a draw</li>
            <li>• Click "New Game" to start a new round</li>
            <li>• Click "Reset Scores" to clear the scoreboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(board: Player[]): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}
