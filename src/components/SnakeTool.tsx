import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import '../styles/global.css';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 12;
const CELL_SIZE = 20;
const INITIAL_SPEED = 250;
const SPEED_INCREMENT = 3;

export default function SnakeTool() {
  const [snake, setSnake] = useState<Position[]>([{ x: 6, y: 6 }]);
  const [food, setFood] = useState<Position>({ x: 9, y: 9 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const scrollStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameFieldRef = useRef<HTMLDivElement>(null);

  const hermesOrange = '#FF7F32';
  const tiffanyBlue = '#81D8D0';

  // Generate random food position
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || isPaused) return;

    setDirection(nextDirection);

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (nextDirection) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check collision
      if (checkCollision(newHead, prevSnake)) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
        }
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        // Increase speed slightly
        setSpeed(prev => Math.max(50, prev - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [nextDirection, food, gameOver, gameStarted, isPaused, checkCollision, generateFood, score, highScore]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, isPaused, speed, moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          if (gameOver) {
            resetGame();
          } else {
            setGameStarted(true);
          }
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver]);

  // Touch controls for desktop
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !gameStarted || gameOver || isPaused) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > 30 || absY > 30) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== 'LEFT') {
          setNextDirection('RIGHT');
        } else if (deltaX < 0 && direction !== 'RIGHT') {
          setNextDirection('LEFT');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== 'UP') {
          setNextDirection('DOWN');
        } else if (deltaY < 0 && direction !== 'DOWN') {
          setNextDirection('UP');
        }
      }
    }

    setTouchStart(null);
  };

  // Scroll controls for mobile
  const handleScroll = (e: WheelEvent | TouchEvent) => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameField = gameFieldRef.current;
    if (!gameField) return;

    let deltaX = 0;
    let deltaY = 0;

    if (e instanceof WheelEvent) {
      deltaX = e.deltaX;
      deltaY = e.deltaY;
    } else if (e instanceof TouchEvent) {
      if (!scrollStartRef.current && e.touches.length > 0) {
        scrollStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return;
      }
      
      if (scrollStartRef.current && e.touches.length > 0) {
        deltaX = scrollStartRef.current.x - e.touches[0].clientX;
        deltaY = scrollStartRef.current.y - e.touches[0].clientY;
        scrollStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Only change direction if scroll is significant
    if (absX > 5 || absY > 5) {
      if (absX > absY) {
        // Horizontal scroll
        if (deltaX > 0 && direction !== 'LEFT') {
          setNextDirection('RIGHT');
        } else if (deltaX < 0 && direction !== 'RIGHT') {
          setNextDirection('LEFT');
        }
      } else {
        // Vertical scroll
        if (deltaY > 0 && direction !== 'UP') {
          setNextDirection('DOWN');
        } else if (deltaY < 0 && direction !== 'DOWN') {
          setNextDirection('UP');
        }
      }
    }
  };

  const handleTouchEndScroll = () => {
    scrollStartRef.current = null;
  };

  useEffect(() => {
    const gameField = gameFieldRef.current;
    if (!gameField) return;

    gameField.addEventListener('wheel', handleScroll, { passive: false });
    gameField.addEventListener('touchmove', handleScroll, { passive: false });
    gameField.addEventListener('touchend', handleTouchEndScroll);

    return () => {
      gameField.removeEventListener('wheel', handleScroll);
      gameField.removeEventListener('touchmove', handleScroll);
      gameField.removeEventListener('touchend', handleTouchEndScroll);
    };
  }, [gameStarted, gameOver, isPaused, direction]);

  const resetGame = () => {
    setSnake([{ x: 6, y: 6 }]);
    setFood({ x: 9, y: 9 });
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  const handleNewGame = () => {
    resetGame();
  };

  const handleResetScore = () => {
    setHighScore(0);
    resetGame();
  };

  return (
    <>
      <style>{`
        .snake-tool-container {
          font-family: 'Inter Tight', sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .snake-back-button {
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
        
        .snake-logo {
          display: none;
        }
        
        .snake-grid {
          display: grid;
          grid-template-columns: 0.5fr 1.5fr;
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .snake-left-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          padding-right: 16px;
          height: 100%;
        }
        
        .snake-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .snake-cell {
          background: ${tiffanyBlue};
        }

        .food-cell {
          background: ${hermesOrange};
          border-radius: 50%;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .food-cell {
          animation: pulse 0.6s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .snake-tool-container {
            padding: 0;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
            overflow-x: hidden;
            display: block;
          }
          
          .snake-back-button {
            position: fixed;
            left: 16px;
            top: 16px;
            transform: none;
            z-index: 2000;
          }
          
          .snake-logo {
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
          
          .snake-grid {
            display: flex;
            flex-direction: column;
            gap: 0;
            padding: 0;
            height: auto;
            min-height: 100vh;
          }
          
          .snake-left-column {
            padding: 16px;
            padding-top: 12px;
            height: auto;
            overflow: visible;
            flex-shrink: 0;
            gap: 12px;
            order: 2;
          }
          
          .snake-right-column {
            position: sticky;
            top: 0;
            height: 80vh;
            overflow: hidden;
            order: 1;
            padding: 0;
            z-index: 1000;
          }

          .mobile-buttons-container {
            padding: 16px !important;
            border-radius: 10px !important;
            margin-bottom: 8px !important;
          }

          .mobile-buttons-grid {
            flex-direction: row !important;
            gap: 8px !important;
          }

          .mobile-button {
            aspect-ratio: auto !important;
            height: 52px !important;
            flex: 1 !important;
            flex-direction: row !important;
            padding: 0 16px !important;
            font-size: 14px !important;
            border-radius: 8px !important;
            gap: 8px !important;
          }

          .mobile-button svg {
            width: 20px !important;
            height: 20px !important;
          }

          .mobile-game-board-container {
            padding: 0 !important;
            border-radius: 0 !important;
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }

          .mobile-game-field {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            aspect-ratio: auto !important;
          }

          .mobile-instructions {
            margin-top: 8px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .snake-back-button {
            left: 12px;
            top: 12px;
          }

          .snake-logo {
            right: 12px;
            top: 12px;
          }

          .mobile-button {
            height: 48px !important;
            font-size: 13px !important;
            padding: 0 12px !important;
          }

          .mobile-button svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      `}</style>
      
      <div className="snake-tool-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="snake-back-button"
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
        <div className="snake-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="snake-grid">
          
          {/* LEFT COLUMN - Buttons & Instructions */}
          <div className="snake-left-column">
            
            {/* Control Buttons */}
            <div className="mobile-buttons-container" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="mobile-buttons-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleNewGame}
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
                  onClick={handleResetScore}
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
                  <span>Reset Score</span>
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mobile-instructions" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', color: '#1A1A1A' }}>How to Play</h3>
              <ul style={{ fontSize: '13px', color: '#6B7280', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                <li><strong>Desktop:</strong> Use Arrow Keys or WASD to move</li>
                <li><strong>Mobile:</strong> Scroll on the game field to control direction</li>
                <li>Eat the <span style={{ color: hermesOrange, fontWeight: 700 }}>orange food</span> to grow</li>
                <li>Press <strong>Space</strong> to pause/resume (desktop)</li>
                <li>Don't hit walls or yourself!</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN - Game Board */}
          <div className="snake-right-column">
            <div 
              ref={gameFieldRef}
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
                touchAction: 'none'
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="mobile-game-field" style={{ 
                width: 'min(100%, calc(100vh - 88px))',
                height: 'min(100%, calc(100vh - 88px))',
                aspectRatio: '1 / 1',
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                gap: '1px',
                background: '#E5E7EB',
                border: '2px solid #1A1A1A',
                position: 'relative'
              }}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                  const isFood = food.x === x && food.y === y;
                  const isHead = snake[0]?.x === x && snake[0]?.y === y;
                  const isTail = snake.length > 1 && snake[snake.length - 1]?.x === x && snake[snake.length - 1]?.y === y;

                  return (
                    <div
                      key={index}
                      className={isSnake ? 'snake-cell' : isFood ? 'food-cell' : ''}
                      style={{
                        background: isSnake ? (isHead || isTail ? '#1A1A1A' : tiffanyBlue) : isFood ? hermesOrange : '#FFFFFF',
                        borderRadius: isFood ? '50%' : '0',
                        transition: 'background 0.1s ease',
                        position: 'relative'
                      }}
                    >
                      {isHead && (
                        <>
                          <div style={{
                            position: 'absolute',
                            width: '25%',
                            height: '25%',
                            background: '#FFFFFF',
                            borderRadius: '50%',
                            top: '25%',
                            left: '20%'
                          }} />
                          <div style={{
                            position: 'absolute',
                            width: '25%',
                            height: '25%',
                            background: '#FFFFFF',
                            borderRadius: '50%',
                            top: '25%',
                            right: '20%'
                          }} />
                        </>
                      )}
                    </div>
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
