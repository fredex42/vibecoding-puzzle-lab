import React, { useState, useEffect } from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

const CrosswordPuzzle = () => {
  const gridLayout = [
    ['1h', 'o', 'l', 'i', 'd', 'a', 'y', '', '', '', '', '', '', '', '', ''],
    ['y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['d', '', '2a', 'n', 't', 'a', '', '', '', '', '', '', '', '', '', ''],
    ['r', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['a', '', '', '3r', 'u', 'm', 'b', 'l', 'e', '', '', '', '', '', '', ''],
    ['t', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['e', '', '', '', '', '', '', '4c', 'a', 't', 'f', 'i', 's', 'h', '', ''],
    ['', '', '5g', 'y', 'r', 'a', 't', 'i', 'o', 'n', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['6t', 'r', 'a', 'n', 's', 'u', 'b', 's', 't', 'a', 'n', 't', 'i', 'a', 't', 'i'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '7k', 'e', 't', 't', 'l'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'e'],
    ['', '', '', '', '8a', 'm', 'o', 'e', 'b', 'a', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '9l', 'a', 'm', 'e', 'n', 't', '', '']
  ];

  const clues = {
    across: [
      { number: 1, clue: "Time off work for rest and recreation (7)", answer: "holiday", row: 0, col: 0 },
      { number: 2, clue: "South American mammal with a long snout (4)", answer: "anta", row: 2, col: 2 },
      { number: 3, clue: "Deep, resonant sound like thunder (6)", answer: "rumble", row: 4, col: 3 },
      { number: 4, clue: "Whiskered freshwater fish (7)", answer: "catfish", row: 6, col: 7 },
      { number: 5, clue: "Circular or spiral motion (8)", answer: "gyration", row: 7, col: 2 },
      { number: 6, clue: "Religious doctrine of bread and wine transformation (18)", answer: "transubstantiation", row: 9, col: 0 },
      { number: 8, clue: "Single-celled organism that changes shape (6)", answer: "amoeba", row: 13, col: 4 },
      { number: 9, clue: "Express grief or sorrow (6)", answer: "lament", row: 15, col: 8 }
    ],
    down: [
      { number: 1, clue: "Restore moisture to the body (7)", answer: "hydrate", row: 0, col: 0 },
      { number: 7, clue: "Pot for boiling water (6)", answer: "kettle", row: 11, col: 11 }
    ]
  };

  const createSolution = () => {
    const sol = {};
    gridLayout.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell && cell !== '') {
          const letter = cell.replace(/[0-9]/g, '');
          if (letter) {
            sol[`${r}-${c}`] = letter.toLowerCase();
          }
        }
      });
    });
    return sol;
  };

  const solution = createSolution();
  const [userInput, setUserInput] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  useEffect(() => {
    const allFilled = Object.keys(solution).every(key => userInput[key]);
    const allCorrect = Object.keys(solution).every(key => 
      userInput[key]?.toLowerCase() === solution[key]
    );
    
    if (allFilled && allCorrect && Object.keys(userInput).length > 0) {
      setIsComplete(true);
      setIsRunning(false);
    }
  }, [userInput]);

  const handleCellClick = (row, col) => {
    if (solution[`${row}-${col}`]) {
      setSelectedCell({ row, col });
      if (!isRunning) setIsRunning(true);
    }
  };

  const handleInputChange = (row, col, value) => {
    if (value.length <= 1 && /^[a-zA-Z]*$/.test(value)) {
      const key = `${row}-${col}`;
      setUserInput(prev => ({
        ...prev,
        [key]: value.toLowerCase()
      }));
      
      if (value && selectedCell) {
        const nextCol = col + 1;
        if (nextCol < gridLayout[0].length && solution[`${row}-${nextCol}`]) {
          setSelectedCell({ row, col: nextCol });
        } else {
          const nextRow = row + 1;
          if (nextRow < gridLayout.length) {
            for (let c = 0; c < gridLayout[0].length; c++) {
              if (solution[`${nextRow}-${c}`]) {
                setSelectedCell({ row: nextRow, col: c });
                break;
              }
            }
          }
        }
      }
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const renderCell = (cell, row, col) => {
    if (!cell || cell === '') {
      return <div key={`${row}-${col}`} className="w-8 h-8 bg-gray-800"></div>;
    }

    const letter = cell.replace(/[0-9]/g, '');
    const number = cell.match(/[0-9]+/);
    const key = `${row}-${col}`;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const value = userInput[key] || '';

    return (
      <div
        key={key}
        className={`w-8 h-8 border border-gray-400 relative cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        } bg-white`}
        onClick={() => handleCellClick(row, col)}
      >
        {number && (
          <span className="absolute top-0 left-0.5 text-[8px] font-bold">
            {number[0]}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(row, col, e.target.value)}
          className="w-full h-full text-center uppercase text-sm font-semibold bg-transparent border-0 outline-none"
          maxLength={1}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Crossword Puzzle</h1>
          <div className="text-2xl font-mono text-indigo-700">{formatTime(seconds)}</div>
        </div>

        {isComplete && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg text-center animate-bounce">
            <h2 className="text-3xl font-bold text-white mb-2">🎉 Congratulations! 🎉</h2>
            <p className="text-xl text-white">You completed the crossword in {formatTime(seconds)}!</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="inline-block">
              {gridLayout.map((row, r) => (
                <div key={r} className="flex">
                  {row.map((cell, c) => renderCell(cell, r, c))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-3">Across</h2>
              <div className="space-y-2">
                {clues.across.map(clue => (
                  <div key={clue.number} className="text-sm">
                    <span className="font-bold text-indigo-700">{clue.number}.</span>{' '}
                    <span className="text-gray-700">{clue.clue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-3">Down</h2>
              <div className="space-y-2">
                {clues.down.map(clue => (
                  <div key={clue.number} className="text-sm">
                    <span className="font-bold text-indigo-700">{clue.number}.</span>{' '}
                    <span className="text-gray-700">{clue.clue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrosswordPuzzle;

createRoot(document.getElementById('root')).render(<CrosswordPuzzle/>)
