import { useEffect, useState } from 'react';

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(element, priority) {
    this.heap.push({ element, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    this.swap(0, this.heap.length - 1);
    const dequeued = this.heap.pop();
    this.sinkDown(0);
    return dequeued.element;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0].element : null;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp(index) {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (element.priority >= parent.priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  sinkDown(index) {
    const element = this.heap[index];
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapIndex = null;

      if (leftChildIndex < this.heap.length) {
        const leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < this.heap.length) {
        const rightChild = this.heap[rightChildIndex];
        if (
          (swapIndex === null && rightChild.priority < element.priority) ||
          (swapIndex !== null && rightChild.priority < this.heap[swapIndex].priority)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;
      this.swap(index, swapIndex);
      index = swapIndex;
    }
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

class Node {
  constructor(board, g, parent = null) {
    this.board = board;
    this.g = g;
    this.h = this.manhattanDistance();
    this.f = this.g + this.h;
    this.parent = parent;
  }

  manhattanDistance() {
    let distance = 0;
    for (let i = 0; i < 9; i++) {
      const value = this.board[i];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        const currentRow = Math.floor(i / 3);
        const currentCol = i % 3;
        distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
      }
    }
    return distance;
  }

  isGoal() {
    for (let i = 0; i < 8; i++) {
      if (this.board[i] !== i + 1) {
        return false;
      }
    }
    return this.board[8] === 0;
  }

  getNeighbors() {
    const neighbors = [];
    const blankIndex = this.board.indexOf(0);
    const row = Math.floor(blankIndex / 3);
    const col = blankIndex % 3;

    const moves = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 },
    ];

    for (const move of moves) {
      if (move.r >= 0 && move.r < 3 && move.c >= 0 && move.c < 3) {
        const newIndex = move.r * 3 + move.c;
        const newBoard = [...this.board];
        [newBoard[blankIndex], newBoard[newIndex]] = [
          newBoard[newIndex],
          newBoard[blankIndex],
        ];
        neighbors.push(new Node(newBoard, this.g + 1, this));
      }
    }
    return neighbors;
  }
}

const solvePuzzle = (initialBoard) => {
  const openSet = new PriorityQueue();
  const startNode = new Node(initialBoard, 0);
  openSet.enqueue(startNode, startNode.f);
  const closedSet = new Set();

  while (!openSet.isEmpty()) {
    const currentNode = openSet.dequeue();

    if (currentNode.isGoal()) {
      const path = [];
      let tempNode = currentNode;
      while (tempNode !== null) {
        path.unshift(tempNode.board);
        tempNode = tempNode.parent;
      }
      return path;
    }

    closedSet.add(currentNode.board.toString());

    for (const neighbor of currentNode.getNeighbors()) {
      if (!closedSet.has(neighbor.board.toString())) {
        openSet.enqueue(neighbor, neighbor.f);
      }
    }
  }
  return null;
};

const isSolvable = (board) => {
  let inversions = 0;
  const boardWithoutZero = board.filter(tile => tile !== 0);

  for (let i = 0; i < boardWithoutZero.length - 1; i++) {
    for (let j = i + 1; j < boardWithoutZero.length; j++) {
      if (boardWithoutZero[i] > boardWithoutZero[j]) {
        inversions++;
      }
    }
  }

  return inversions % 2 === 0;
};

const shuffleBoard = () => {
  let newBoard = [];
  do {
    newBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0].sort(() => Math.random() - 0.5);
  } while (!isSolvable(newBoard));
  return newBoard;
};

const App = () => {
  const [board, setBoard] = useState(shuffleBoard);
  const [isSolved, setIsSolved] = useState(false);
  const [solutionPath, setSolutionPath] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (JSON.stringify(board) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 0])) {
      setIsSolved(true);
      setSolutionPath(null);
    } else {
      setIsSolved(false);
    }
  }, [board]);

  useEffect(() => {
    if (solutionPath && stepIndex < solutionPath.length) {
      const timer = setTimeout(() => {
        setBoard(solutionPath[stepIndex]);
        setStepIndex(stepIndex + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [solutionPath, stepIndex]);

  const handleTileClick = (index) => {
    if (isSolved || solutionPath) return;

    const blankIndex = board.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const blankRow = Math.floor(blankIndex / 3);
    const blankCol = blankIndex % 3;

    if (
      (Math.abs(row - blankRow) === 1 && col === blankCol) ||
      (Math.abs(col - blankCol) === 1 && row === blankRow)
    ) {
      const newBoard = [...board];
      [newBoard[index], newBoard[blankIndex]] = [newBoard[blankIndex], newBoard[index]];
      setBoard(newBoard);
    }
  };

  const handleShuffle = () => {
    setBoard(shuffleBoard());
    setSolutionPath(null);
    setStepIndex(0);
  };

  const handleSolve = () => {
    const path = solvePuzzle(board);
    if (path) {
      setSolutionPath(path);
      setStepIndex(1);
    } else {
      console.log('No solution found.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">8 Puzzle Game</h1>
        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-700 rounded-lg">
          {board.map((tile, index) => (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              className={`
                flex items-center justify-center w-24 h-24 text-2xl font-bold rounded-xl shadow-lg
                cursor-pointer transition-all duration-300 transform hover:scale-105
                ${tile === 0 ? 'bg-gray-700 cursor-default' : 'bg-yellow-400 text-gray-900 active:scale-95'}
              `}
            >
              {tile !== 0 ? tile : ''}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center">
          {isSolved && (
            <p className="text-green-400 text-lg font-semibold mb-4 animate-pulse">
              Puzzle Solved! Congratulations!
            </p>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleShuffle}
              disabled={solutionPath}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all duration-300
                ${solutionPath ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
              `}
            >
              Shuffle
            </button>
            <button
              onClick={handleSolve}
              disabled={isSolved || solutionPath}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all duration-300
                ${isSolved || solutionPath ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'}
              `}
            >
              Solve with A*
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
