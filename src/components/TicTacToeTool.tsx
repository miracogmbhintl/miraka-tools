import { useState } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import '../styles/global.css';

type Player = 'X' | 'O' | null;

export default function TicTacToeTool() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

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
      if (newWinner) {
        setShowWinAnimation(true);
      }
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

  const handleBoardClick = () => {
    if (gameOver) {
      resetGame();
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setShowWinAnimation(false);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
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

  // Calculate line position for winning animation
  const getLineStyles = () => {
    if (winningLine.length === 0) return null;
    
    const [a, b, c] = winningLine;
    
    // Horizontal lines
    if (a === 0 && b === 1 && c === 2) return { top: '16.66%', left: '0%', width: '100%', height: '2px', transform: 'translateY(-50%)' };
    if (a === 3 && b === 4 && c === 5) return { top: '50%', left: '0%', width: '100%', height: '2px', transform: 'translateY(-50%)' };
    if (a === 6 && b === 7 && c === 8) return { top: '83.33%', left: '0%', width: '100%', height: '2px', transform: 'translateY(-50%)' };
    
    // Vertical lines
    if (a === 0 && b === 3 && c === 6) return { left: '16.66%', top: '0%', width: '2px', height: '100%', transform: 'translateX(-50%)' };
    if (a === 1 && b === 4 && c === 7) return { left: '50%', top: '0%', width: '2px', height: '100%', transform: 'translateX(-50%)' };
    if (a === 2 && b === 5 && c === 8) return { left: '83.33%', top: '0%', width: '2px', height: '100%', transform: 'translateX(-50%)' };
    
    // Diagonal lines
    if (a === 0 && b === 4 && c === 8) return { left: '50%', top: '50%', width: '141%', height: '2px', transform: 'translate(-50%, -50%) rotate(45deg)' };
    if (a === 2 && b === 4 && c === 6) return { left: '50%', top: '50%', width: '141%', height: '2px', transform: 'translate(-50%, -50%) rotate(-45deg)' };
    
    return null;
  };

  const lineStyles = getLineStyles();

  // Color definitions
  const tiffanyBlue = '#81D8D0'; // Tiffany Blue for X
  const hermesOrange = '#FF7F32'; // Hermès Orange for O

  return (
    <>
      <style>{`
        .tictactoe-tool-container {
          font-family: 'Inter Tight', sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .tictactoe-back-button {
          position: fixed;
          left: calc((40px + 24px) / 2);
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          z-index: 1000;
          transition: all 0.2s ease;
        }
        
        .tictactoe-logo {
          display: none;
        }
        
        .tictactoe-grid {
          display: grid;
          grid-template-columns: 0.5fr 1.5fr;
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .tictactoe-left-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          padding-right: 16px;
          height: 100%;
        }
        
        .tictactoe-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @keyframes winLineAnimation {
          from {
            transform: translate(-50%, -50%) scaleX(0);
          }
          to {
            transform: translate(-50%, -50%) scaleX(1);
          }
        }

        @keyframes winLineDiagonalAnimation {
          from {
            width: 0;
          }
          to {
            width: 141%;
          }
        }

        @keyframes cellWhiteFlash {
          0% {
            background: #FFFFFF;
          }
          50% {
            background: #FFFFFF;
          }
          100% {
            background: #FFFFFF;
          }
        }

        @keyframes winnerCharacterPop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }

        .win-line {
          position: absolute;
          background: #1A1A1A;
          z-index: 10;
          animation: winLineAnimation 0.5s ease-out forwards;
          transform-origin: center;
        }

        .win-line.diagonal {
          animation: winLineDiagonalAnimation 0.5s ease-out forwards;
        }

        .winning-cell {
          animation: cellWhiteFlash 0.5s ease-out forwards, winnerCharacterPop 0.6s ease-out 0.3s;
        }
        
        @media (max-width: 768px) {
          .tictactoe-tool-container {
            padding: 16px;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          
          .tictactoe-back-button {
            position: fixed;
            left: 16px;
            top: 16px;
            transform: none;
            z-index: 2000;
          }
          
          .tictactoe-logo {
            display: block;
            position: fixed;
            right: 16px;
            top: 16px;
            z-index: 2000;
            font-family: 'Inter Tight', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
          }
          
          .tictactoe-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 0;
            padding-top: 60px;
            height: 100%;
            max-height: 100vh;
            overflow: hidden;
          }
          
          .tictactoe-left-column {
            padding-right: 0;
            height: auto;
            overflow: visible;
            flex-shrink: 0;
            gap: 10px;
          }
          
          .tictactoe-right-column {
            position: relative;
            height: auto;
            overflow: visible;
            flex: 1;
            min-height: 0;
            display: flex;
          }

          /* Mobile-optimized scoreboard */
          .mobile-scoreboard {
            padding: 12px 16px !important;
          }

          .mobile-scoreboard-title {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }

          .mobile-scoreboard-title svg {
            width: 14px !important;
            height: 14px !important;
          }

          .mobile-score-grid {
            gap: 8px !important;
          }

          .mobile-score-label {
            font-size: 13px !important;
            margin-bottom: 2px !important;
          }

          .mobile-score-number {
            font-size: 24px !important;
            margin-bottom: 2px !important;
          }

          .mobile-score-text {
            font-size: 10px !important;
          }

          /* Mobile player indicators - compact side by side */
          .mobile-player-indicators {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }

          .mobile-player-card {
            padding: 12px !important;
            border-radius: 10px !important;
          }

          .mobile-player-character {
            font-size: 32px !important;
          }

          .mobile-player-label {
            font-size: 9px !important;
          }

          /* Mobile buttons - horizontal layout */
          .mobile-buttons-container {
            padding: 12px !important;
            border-radius: 10px !important;
          }

          .mobile-buttons-grid {
            flex-direction: row !important;
            gap: 8px !important;
          }

          .mobile-button {
            aspect-ratio: auto !important;
            height: 48px !important;
            flex: 1 !important;
            flex-direction: row !important;
            padding: 0 12px !important;
            font-size: 13px !important;
            border-radius: 8px !important;
            gap: 6px !important;
          }

          .mobile-button svg {
            width: 18px !important;
            height: 18px !important;
          }

          /* Mobile game board - maximize space */
          .mobile-game-board-container {
            padding: 16px !important;
            border-radius: 12px !important;
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .mobile-game-board {
            width: 100% !important;
            height: 100% !important;
            max-width: min(100%, 100vw - 32px) !important;
            max-height: min(100%, 100vw - 32px) !important;
            aspect-ratio: 1 / 1 !important;
          }

          .mobile-game-cell {
            font-size: clamp(40px, 12vw, 80px) !important;
          }
        }

        @media (max-width: 480px) {
          .tictactoe-tool-container {
            padding: 12px;
          }

          .tictactoe-back-button {
            left: 12px;
            top: 12px;
          }

          .tictactoe-logo {
            right: 12px;
            top: 12px;
          }

          .tictactoe-grid {
            padding-top: 56px;
            gap: 10px;
          }

          .mobile-scoreboard {
            padding: 10px 12px !important;
          }

          .mobile-score-number {
            font-size: 22px !important;
          }

          .mobile-player-character {
            font-size: 28px !important;
          }

          .mobile-button {
            height: 44px !important;
            font-size: 12px !important;
          }

          .mobile-game-cell {
            font-size: clamp(36px, 11vw, 70px) !important;
          }
        }
      `}</style>
      
      <div className="tictactoe-tool-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="tictactoe-back-button"
          onMouseEnter={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.setAttribute('stroke', '#F37021');
          }}
          onMouseLeave={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.setAttribute('stroke', '#1A1A1A');
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>

        {/* Logo - Mobile Only */}
        <div className="tictactoe-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="tictactoe-grid">
          
          {/* LEFT COLUMN - Scoreboard & Buttons */}
          <div className="tictactoe-left-column">
            
            {/* Scoreboard */}
            <div className="mobile-scoreboard" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="mobile-scoreboard-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                <Trophy size={18} strokeWidth={2.5} style={{ color: '#F37021' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1A1A1A' }}>Scoreboard</h2>
              </div>
              <div className="mobile-score-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                <div>
                  <div className="mobile-score-label" style={{ fontSize: '18px', fontWeight: 700, color: tiffanyBlue, marginBottom: '4px' }}>X</div>
                  <div className="mobile-score-number" style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{scores.X}</div>
                  <div className="mobile-score-text" style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Wins</div>
                </div>
                <div>
                  <div className="mobile-score-label" style={{ fontSize: '18px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>Draw</div>
                  <div className="mobile-score-number" style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{scores.draws}</div>
                  <div className="mobile-score-text" style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Games</div>
                </div>
                <div>
                  <div className="mobile-score-label" style={{ fontSize: '18px', fontWeight: 700, color: hermesOrange, marginBottom: '4px' }}>O</div>
                  <div className="mobile-score-number" style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{scores.O}</div>
                  <div className="mobile-score-text" style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Wins</div>
                </div>
              </div>
            </div>

            {/* Current Player Indicators - X and O side by side */}
            <div className="mobile-player-indicators" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {/* X Indicator */}
              <div className="mobile-player-card" style={{
                background: isXNext && !winner && !gameOver ? '#1A1A1A' : '#FFFFFF',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <div className="mobile-player-character" style={{ 
                  fontSize: '48px', 
                  fontWeight: 700, 
                  color: tiffanyBlue,
                  lineHeight: 1
                }}>X</div>
                <div className="mobile-player-label" style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: isXNext && !winner && !gameOver ? '#FFFFFF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {winner === 'X' ? 'Winner!' : 'Player'}
                </div>
              </div>

              {/* O Indicator */}
              <div className="mobile-player-card" style={{
                background: !isXNext && !winner && !gameOver ? '#1A1A1A' : '#FFFFFF',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <div className="mobile-player-character" style={{ 
                  fontSize: '48px', 
                  fontWeight: 700, 
                  color: hermesOrange,
                  lineHeight: 1
                }}>O</div>
                <div className="mobile-player-label" style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: !isXNext && !winner && !gameOver ? '#FFFFFF' : '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {winner === 'O' ? 'Winner!' : 'Player'}
                </div>
              </div>
            </div>

            {/* Control Buttons - Square 1:1 format on desktop, horizontal on mobile */}
            <div className="mobile-buttons-container" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="mobile-buttons-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={resetGame}
                  className="mobile-button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    padding: '20px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter Tight, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <RotateCcw size={28} strokeWidth={2.5} />
                  <span>New Game</span>
                </button>
                <button
                  onClick={resetScores}
                  className="mobile-button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    padding: '20px',
                    background: '#F3F4F6',
                    color: '#1A1A1A',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter Tight, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E5E7EB';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <RotateCcw size={28} strokeWidth={2.5} />
                  <span>Reset Scores</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Full Height Game Board */}
          <div className="tictactoe-right-column">
            
            {/* Game Board - Perfect Square 1:1 */}
            <div 
              onClick={handleBoardClick}
              className="mobile-game-board-container"
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                cursor: gameOver ? 'pointer' : 'default'
              }}
            >
              <div className="mobile-game-board" style={{ 
                width: 'min(100%, calc(100vh - 88px))',
                height: 'min(100%, calc(100vh - 88px))',
                aspectRatio: '1 / 1',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: 0,
                position: 'relative'
              }}>
                {/* Winning Line Animation */}
                {showWinAnimation && lineStyles && (
                  <div 
                    className={`win-line ${winningLine[0] === 0 && winningLine[2] === 8 || winningLine[0] === 2 && winningLine[2] === 6 ? 'diagonal' : ''}`}
                    style={lineStyles}
                  />
                )}

                {board.map((cell, index) => {
                  const row = Math.floor(index / 3);
                  const col = index % 3;
                  const isWinningCell = winningLine.includes(index);
                  
                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(index);
                      }}
                      disabled={!!cell || !!winner || gameOver}
                      className={`mobile-game-cell ${isWinningCell && showWinAnimation ? 'winning-cell' : ''}`}
                      style={{
                        background: '#FFFFFF',
                        border: 'none',
                        borderTop: row > 0 ? '2px solid #1A1A1A' : 'none',
                        borderLeft: col > 0 ? '2px solid #1A1A1A' : 'none',
                        fontSize: 'clamp(48px, 8vw, 100px)',
                        fontWeight: 700,
                        fontFamily: 'Inter Tight, sans-serif',
                        color: cell === 'X' ? tiffanyBlue : hermesOrange,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        zIndex: isWinningCell ? 20 : 1
                      }}
                      onTouchStart={(e) => {
                        if (!cell && !winner && !gameOver) {
                          e.currentTarget.style.background = '#FAFAFA';
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (!isWinningCell || !showWinAnimation) {
                          e.currentTarget.style.background = '#FFFFFF';
                        }
                      }}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
