import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Импорт Firebase
import './App.css';

function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentColor, setCurrentColor] = useState('red');
  const [colorCounts, setColorCounts] = useState({});
  const [usedColors, setUsedColors] = useState([]); // Для хранения цветов, которые были использованы
  const [userId, setUserId] = useState(getUserId());
  const [cooldown, setCooldown] = useState(false);
  const [timer, setTimer] = useState(10); // Инициализируем таймер с 10 секундами
  useEffect(() => {
    const cellsRef = db.ref('cells');

    cellsRef.on('value', (snapshot) => {
      const updatedGrid = createEmptyGrid();

      snapshot.forEach((userSnapshot) => {
        userSnapshot.forEach((cellSnapshot) => {
          const cellData = cellSnapshot.val();
          const { row, col, color } = cellData;

          updatedGrid[row][col] = color;

          // Добавляем цвет в список использованных цветов, если его там еще нет
          if (!usedColors.includes(color)) {
            setUsedColors((prevUsedColors) => [...prevUsedColors, color]);
          }
        });
      });

      setGrid(updatedGrid);
    });

    // Отключите обработчик события при размонтировании компонента
    return () => {
      cellsRef.off('value');
    };
  }, [usedColors]);

  // Загрузка данных о цветах и их использованиях из Firebase
  useEffect(() => {
    const colorsRef = db.ref('colors');

    colorsRef.on('value', (snapshot) => {
      const updatedColorCounts = snapshot.val() || {};

      setColorCounts(updatedColorCounts);
    });

    // Отключите обработчик события при размонтировании компонента
    return () => {
      colorsRef.off('value');
    };
  }, []);

  function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Date.now().toString();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  useEffect(() => {
    if (cooldown) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1); // Уменьшаем таймер каждую секунду
      }, 1000);

      // Когда таймер достигнет 0, сбрасываем охлаждение и сбрасываем таймер
      if (timer === 0) {
        setCooldown(false);
        setTimer(10); // Сброс таймера обратно на 10 секунд
      }

      // Очистка интервала при размонтировании компонента
      return () => {
        clearInterval(interval);
      };
    }
  }, [cooldown, timer]);

  useEffect(() => {
    const colorsRef = db.ref('colors');

    colorsRef.on('value', (snapshot) => {
      const updatedColorCounts = snapshot.val() || {};
      setColorCounts(updatedColorCounts);
    });

    // Отключите обработчик события при размонтировании компонента
    return () => {
      colorsRef.off('value');
    };
  }, [setColorCounts]); // Добавьте setColorCounts в массив зависимостей

  function createEmptyGrid() {
    const rows = 50;
    const cols = 50;
    const emptyGrid = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push('white');
      }
      emptyGrid.push(row);
    }

    return emptyGrid;
  }

  function handleCellClick(row, col) {
    if (!cooldown) {
      const newGrid = [...grid];
      newGrid[row][col] = currentColor;
      setGrid(newGrid);

      setColorCounts((prevCounts) => ({
        ...prevCounts,
        [currentColor]: (prevCounts[currentColor] || 0) + 1,
      }));

      setCooldown(true);
      db.ref(`cells/${userId}`).push({
        row,
        col,
        color: currentColor,
      });

      db.ref(`colors/${currentColor}`).transaction((currentCount) => {
        return (currentCount || 0) + 1;
      });

      setCooldown(true);
    }
  }

  function renderGrid() {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cellColor, colIndex) => (
          <div
            key={colIndex}
            className="cell"
            style={{ backgroundColor: cellColor }}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          ></div>
        ))}
      </div>
    ));
  }

  const rainbowColors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
  ];

  return (
    <div className="App">
      <div id="color-buttons">
        {rainbowColors.map((color, index) => (
          <button
            key={index}
            style={{ backgroundColor: color }}
            onClick={() => setCurrentColor(color)}
          ></button>
        ))}
      </div>
      <div id="content-container">
        <div id="color-counts">
          {usedColors.map((color, index) => (
            <p key={index}>
              {color}: {colorCounts[color] || 0}
            </p>
          ))}
        </div>
        <div id="timer-container">
          <p>Таймер: {timer} сек.</p>
        </div>
        <div id="grid-container">{renderGrid()}</div>
      </div>
    </div>
  );
}

export default App;
