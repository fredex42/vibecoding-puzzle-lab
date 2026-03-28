import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const SudokuPuzzle = () => {
  const [solution, setSolution] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [conflicts, setConflicts] = useState(new Set());

  // Generate a valid 3x3 Sudoku solution
  const generateSolution = useCallback(() => {
    const grid = Array(3).fill(null).map(() => Array(3).fill(0));
    const numbers = [1, 2, 3];
    
    // Simple generation for 3x3 - try random placements with backtracking
    const isValid = (grid, row, col, num) => {
      // Check row
      for (let x = 0; x < 3; x++) {
        if (grid[row][x] === num) return false;
      }
      // Check column
      for (let x = 0; x < 3; x++) {
        if (grid[x][col] === num) return false;
      }
      return true;
    };

    const solve = (grid) => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (grid[row][col] === 0) {
            const nums = [...numbers].sort(() => Math.random() - 0.5);
            for (let num of nums) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solve(grid)) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(grid);
    return grid;
  }, []);


  // Generate puzzle by removing numbers from solution
  const generatePuzzle = useCallback((solution) => {
    const puzzle = solution.map(row => [...row]);
    // For easy level, remove 3-4 numbers
    const cellsToRemove = 3 + Math.floor(Math.random() * 2);
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 3);
      const col = Math.floor(Math.random() * 3);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    return puzzle;
  }, []);

  // Initialize puzzle on mount
  useEffect(() => {
    const newSolution = generateSolution();
    const newPuzzle = generatePuzzle(newSolution);
    setSolution(newSolution);
    setPuzzle(newPuzzle);
    setUserGrid(newPuzzle.map(row => [...row]));
    setIsTimerActive(true);
  }, [generateSolution, generatePuzzle]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && !isComplete) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isComplete]);

  // Check for conflicts
  useEffect(() => {
    const newConflicts = new Set();
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const value = userGrid[row][col];
        if (value === 0) continue;
        
        // Check row conflicts
        for (let c = 0; c < 3; c++) {
          if (c !== col && userGrid[row][c] === value) {
            newConflicts.add(`${row}-${col}`);
            newConflicts.add(`${row}-${c}`);
          }
        }
        
        // Check column conflicts
        for (let r = 0; r < 3; r++) {
          if (r !== row && userGrid[r][col] === value) {
            newConflicts.add(`${row}-${col}`);
            newConflicts.add(`${r}-${col}`);
          }
        }
      }
    }
    
    setConflicts(newConflicts);
  }, [userGrid]);

  // Check if puzzle is complete and correct
  useEffect(() => {
    if (userGrid.length === 0) return;
    
    let filled = true;
    let correct = true;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (userGrid[row][col] === 0) {
          filled = false;
        } else if (userGrid[row][col] !== solution[row][col]) {
          correct = false;
        }
      }
    }
    
    if (filled && correct && conflicts.size === 0) {
      setIsComplete(true);
      setShowCelebration(true);
      setIsTimerActive(false);
    }
  }, [userGrid, solution, conflicts]);

  const handleCellClick = (row, col) => {
    if (puzzle[row][col] !== 0) return; // Don't allow editing given numbers
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;
    
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = num;
    setUserGrid(newGrid);
  };

  const handleClear = () => {
    const newSolution = generateSolution();
    const newPuzzle = generatePuzzle(newSolution);
    setSolution(newSolution);
    setPuzzle(newPuzzle);
    setUserGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setIsComplete(false);
    setShowCelebration(false);
    setTimer(0);
    setIsTimerActive(true);
  };

  const handleHint = () => {
    if (isComplete) return;
    
    // Find an empty cell that's incorrect or empty
    const emptyCells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (puzzle[row][col] === 0 && userGrid[row][col] !== solution[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newGrid = userGrid.map(r => [...r]);
      newGrid[randomCell.row][randomCell.col] = solution[randomCell.row][randomCell.col];
      setUserGrid(newGrid);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-indigo-900">3×3 Sudoku</h1>
        <p className="text-center text-gray-600 mb-6">Fill each row and column with 1, 2, and 3</p>
        
        {/* Timer */}
        <div className="text-center mb-4">
          <div className="inline-block bg-indigo-100 px-4 py-2 rounded-lg">
            <span className="text-2xl font-mono font-bold text-indigo-900">{formatTime(timer)}</span>
          </div>
        </div>

        {/* Sudoku Grid */}
        <div className="mb-6 flex justify-center">
          <div className="inline-block border-4 border-indigo-900 rounded-lg overflow-hidden">
            {userGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => {
                  const isGiven = puzzle[rowIndex][colIndex] !== 0;
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const hasConflict = conflicts.has(`${rowIndex}-${colIndex}`);
                  
                  return (
                    <div
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-20 h-20 flex items-center justify-center text-2xl font-bold
                        border border-gray-300 cursor-pointer transition-all
                        ${isGiven ? 'bg-indigo-50 text-indigo-900' : 'bg-white text-blue-600'}
                        ${isSelected ? 'ring-4 ring-indigo-400' : ''}
                        ${hasConflict ? 'bg-red-100 text-red-600' : ''}
                        ${!isGiven ? 'hover:bg-blue-50' : ''}
                      `}
                    >
                      {cell !== 0 ? cell : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Number Input */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-bold rounded-lg shadow-md transition-all transform hover:scale-105"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(0)}
            className="w-16 h-16 bg-gray-400 hover:bg-gray-500 text-white text-lg font-bold rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            Clear
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleHint}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all"
          >
            💡 Hint
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all"
          >
            🔄 New Puzzle
          </button>
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center transform animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-indigo-900 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-4">You solved the puzzle in {formatTime(timer)}!</p>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  handleClear();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuPuzzle;

const root = document.getElementById('root');
if (root) {
  const rootElement = createRoot(root);
  rootElement.render(<SudokuPuzzle />);
}