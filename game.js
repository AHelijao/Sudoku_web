document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('sudoku-board');
  const numberSelector = document.getElementById('number-selector');
  let selectedCell = null;

  // Generate a fully solved Sudoku board using backtracking
  function generateSudoku() {
    const sudoku = Array(81).fill(0);

    function isSafe(sudoku, index, num) {
      const row = Math.floor(index / 9);
      const col = index % 9;

      for (let c = 0; c < 9; c++) {
        if (sudoku[row * 9 + c] === num) return false;
      }
      for (let r = 0; r < 9; r++) {
        if (sudoku[r * 9 + col] === num) return false;
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (sudoku[(boxRow + r) * 9 + (boxCol + c)] === num) return false;
        }
      }
      return true;
    }

    function fillBoard(pos = 0) {
      if (pos >= 81) return true;
      if (sudoku[pos] !== 0) return fillBoard(pos + 1);

      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

      for (let num of nums) {
        if (isSafe(sudoku, pos, num)) {
          sudoku[pos] = num;
          if (fillBoard(pos + 1)) return true;
          sudoku[pos] = 0;
        }
      }
      return false;
    }

    fillBoard();
    return sudoku;
  }

  function createPuzzle(fullBoard, difficulty) {
    const puzzle = fullBoard.slice();
    let cellsToRemove;

    switch (difficulty) {
      case 'easy': cellsToRemove = 35; break;
      case 'medium': cellsToRemove = 45; break;
      case 'hard': cellsToRemove = 55; break;
      default: cellsToRemove = 35;
    }

    while (cellsToRemove > 0) {
      const idx = Math.floor(Math.random() * 81);
      if (puzzle[idx] !== 0) {
        puzzle[idx] = 0;
        cellsToRemove--;
      }
    }
    return puzzle;
  }

  function getDifficulty() {
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level');
    if (level && ['easy', 'medium', 'hard'].includes(level.toLowerCase())) {
      return level.toLowerCase();
    }
    return 'easy';
  }

  const difficulty = getDifficulty();
  const fullBoard = generateSudoku();
  const puzzle = createPuzzle(fullBoard, difficulty);

  boardEl.innerHTML = '';

  // Render the board
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    const row = Math.floor(i / 9);
    if (i % 9 === 2 || i % 9 === 5) cell.style.borderRightWidth = '3px';
    if (row === 2 || row === 5) cell.style.borderBottomWidth = '3px';

    if (puzzle[i] !== 0) {
      cell.textContent = puzzle[i];
      cell.classList.add('fixed');
    } else {
      cell.addEventListener('click', () => selectCell(cell));
    }

    boardEl.appendChild(cell);
  }

  function selectCell(cell) {
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = cell;
    selectedCell.classList.add('selected');
  }

  function getBoardValues() {
    return Array.from(boardEl.children).map(cell => {
      return cell.textContent ? Number(cell.textContent) : 0;
    });
  }

  function isValid(boardArr, index, value) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    for (let c = 0; c < 9; c++) {
      if (c !== col && boardArr[row * 9 + c] === value) return false;
    }

    for (let r = 0; r < 9; r++) {
      if (r !== row && boardArr[r * 9 + col] === value) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellIndex = (boxRow + r) * 9 + (boxCol + c);
        if (cellIndex !== index && boardArr[cellIndex] === value) return false;
      }
    }
    return true;
  }

  function isBoardComplete() {
    const values = getBoardValues();
    return values.every((val, i) => val !== 0 && isValid(values, i, val));
  }

  numberSelector.addEventListener('click', e => {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;

    const btn = e.target.closest('.num-btn');
    if (!btn) return;

    if (btn.id === 'clear-btn') {
      selectedCell.textContent = '';
      selectedCell.classList.remove('invalid');
      return;
    }

    const val = Number(btn.textContent);
    const cellsArr = getBoardValues();
    const idx = Array.from(boardEl.children).indexOf(selectedCell);

    if (isValid(cellsArr, idx, val)) {
      selectedCell.textContent = val;
      selectedCell.classList.remove('invalid');

      if (isBoardComplete()) {
        setTimeout(() => alert('🎉 Congratulations! You solved the puzzle!'), 100);
      }
    } else {
      selectedCell.classList.add('invalid');
      setTimeout(() => selectedCell.classList.remove('invalid'), 800);
    }
  });
});
