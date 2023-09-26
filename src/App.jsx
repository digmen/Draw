import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentColor, setCurrentColor] = useState('red');
  const [colorCounts, setColorCounts] = useState({});
  const [userId, setUserId] = useState(getUserId());
  const [cooldown, setCooldown] = useState(false);
  const [timer, setTimer] = useState(10); // Инициализируем таймер с 10 секундами

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

  const db = firebase.database();
  const colorsRef = db.ref('colors'); // Создайте ссылку на узел в базе данных

  function updateColor(row, col, color) {
    colorsRef.child(`${row}_${col}`).set(color);
  }

  // Создайте слушателя для узла colors
  colorsRef.on('child_changed', (snapshot) => {
    const { key, val } = snapshot;
    const [row, col] = key.split('_');

    // Обновите ваш интерфейс, чтобы отобразить новый цвет для клетки в позиции row, col
  });

  // Читайте данные из Firebase и инициализируйте ваш интерфейс
  colorsRef.once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const { key, val } = childSnapshot;
      const [row, col] = key.split('_');

      // Используйте val (цвет) для установки цвета клетки в позиции row, col
    });
  });

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
          {rainbowColors.map((color, index) => (
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
