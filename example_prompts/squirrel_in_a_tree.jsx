import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const SquirrelPuzzle = () => {
  const [squirrelPosition, setSquirrelPosition] = useState({ x: 50, y: 30 });
  const [acorns, setAcorns] = useState([
    { id: 1, x: 20, y: 60, collected: false },
    { id: 2, x: 40, y: 80, collected: false },
    { id: 3, x: 70, y: 50, collected: false },
    { id: 4, x: 85, y: 75, collected: false },
    { id: 5, x: 30, y: 40, collected: false }
  ]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !gameWon) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameWon) {
      setGameOver(true);
    }
  }, [timeLeft, gameWon]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || gameWon) return;

      const moveDistance = 5;
      let newX = squirrelPosition.x;
      let newY = squirrelPosition.y;

      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY = Math.max(10, squirrelPosition.y - moveDistance);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY = Math.min(85, squirrelPosition.y + moveDistance);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(5, squirrelPosition.x - moveDistance);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(90, squirrelPosition.x + moveDistance);
          break;
        default:
          return;
      }

      setSquirrelPosition({ x: newX, y: newY });
      checkAcornCollection(newX, newY);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [squirrelPosition, acorns, gameOver, gameWon]);

  const checkAcornCollection = (x, y) => {
    setAcorns(prevAcorns => {
      const updatedAcorns = prevAcorns.map(acorn => {
        if (!acorn.collected) {
          const distance = Math.sqrt(
            Math.pow(acorn.x - x, 2) + Math.pow(acorn.y - y, 2)
          );
          if (distance < 8) {
            setScore(prev => prev + 1);
            return { ...acorn, collected: true };
          }
        }
        return acorn;
      });

      if (updatedAcorns.every(acorn => acorn.collected)) {
        setGameWon(true);
      }

      return updatedAcorns;
    });
  };

  const resetGame = () => {
    setSquirrelPosition({ x: 50, y: 30 });
    setAcorns([
      { id: 1, x: 20, y: 60, collected: false },
      { id: 2, x: 40, y: 80, collected: false },
      { id: 3, x: 70, y: 50, collected: false },
      { id: 4, x: 85, y: 75, collected: false },
      { id: 5, x: 30, y: 40, collected: false }
    ]);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setGameWon(false);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-300 to-sky-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-4">
          🐿️ Squirrel's Acorn Hunt
        </h1>
        
        <div className="flex justify-between mb-4 text-lg font-semibold">
          <div className="text-amber-700">Acorns: {score}/5</div>
          <div className="text-red-600">Time: {timeLeft}s</div>
        </div>

        <div className="relative w-full bg-gradient-to-b from-amber-900 to-amber-700 rounded-lg overflow-hidden" 
             style={{ height: '500px' }}>
          
          {/* Tree branches decorative elements */}
          <div className="absolute top-0 left-1/4 w-2 h-20 bg-amber-800"></div>
          <div className="absolute top-16 left-1/4 w-20 h-2 bg-amber-800"></div>
          <div className="absolute top-0 right-1/3 w-2 h-32 bg-amber-800"></div>
          <div className="absolute top-28 right-1/3 w-24 h-2 bg-amber-800"></div>
          <div className="absolute top-10 left-1/2 w-2 h-40 bg-amber-800"></div>
          <div className="absolute top-44 left-1/2 w-28 h-2 bg-amber-800"></div>
          
          {/* Foliage */}
          <div className="absolute top-0 left-0 w-full h-24 bg-green-600 opacity-30 rounded-full"></div>
          <div className="absolute top-5 right-10 w-32 h-32 bg-green-700 opacity-40 rounded-full"></div>
          <div className="absolute top-12 left-16 w-40 h-40 bg-green-600 opacity-35 rounded-full"></div>

          {/* Squirrel */}
          <div 
            className="absolute transition-all duration-100"
            style={{
              left: `${squirrelPosition.x}%`,
              top: `${squirrelPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-4xl">🐿️</div>
          </div>

          {/* Acorns */}
          {acorns.map(acorn => (
            !acorn.collected && (
              <div
                key={acorn.id}
                className="absolute transition-all duration-300"
                style={{
                  left: `${acorn.x}%`,
                  top: `${acorn.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-3xl animate-pulse">🌰</div>
              </div>
            )
          ))}

          {/* Game Over Overlay */}
          {(gameOver || gameWon) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {gameWon ? '🎉 You Won!' : '⏰ Time\'s Up!'}
                </h2>
                <p className="text-xl mb-4">
                  You collected {score} out of 5 acorns
                </p>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-gray-700">
          <p className="font-semibold">Use Arrow Keys or WASD to move the squirrel</p>
          <p className="text-sm">Collect all 5 acorns before time runs out!</p>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SquirrelPuzzle />);

export default SquirrelPuzzle;