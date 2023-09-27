import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Импорт Firebase
import './App.css';

function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentColor, setCurrentColor] = useState('red');
  const [colorCounts, setColorCounts] = useState({});
  const [usedColors, setUsedColors] = useState(new Set()); // Для хранения цветов, которые были использованы
  const [userId, setUserId] = useState(getUserId());
  const [cooldown, setCooldown] = useState(false);
  const [timer, setTimer] = useState(
    parseInt(localStorage.getItem('timer')) || 0
  );
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const timerFromStorage = localStorage.getItem('timer'); // Получаем значение таймера из localStorage
    if (timerFromStorage !== null) {
      setTimer(parseInt(timerFromStorage)); // Устанавливаем таймер из localStorage
    }
  }, []);

  useEffect(() => {
    if (timer > 0 && cooldown) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          localStorage.setItem('timer', prevTimer - 1);
          return prevTimer - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [timer, cooldown]);

  useEffect(() => {
    const cellsRef = db.ref('cells');

    cellsRef.on('value', (snapshot) => {
      const updatedGrid = createEmptyGrid();
      const updatedUsedColors = new Set();

      snapshot.forEach((userSnapshot) => {
        userSnapshot.forEach((cellSnapshot) => {
          const cellData = cellSnapshot.val();
          const { row, col, color } = cellData;

          updatedGrid[row][col] = color;

          updatedUsedColors.add(color);
        });
      });

      setGrid(updatedGrid);
      setUsedColors(updatedUsedColors);
    });

    return () => {
      cellsRef.off('value');
    };
  }, []);

  useEffect(() => {
    const colorsRef = db.ref('colors');

    colorsRef.on('value', (snapshot) => {
      const updatedColorCounts = snapshot.val() || {};
      setColorCounts(updatedColorCounts);
    });

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
    const colorsRef = db.ref('colors');

    colorsRef.on('value', (snapshot) => {
      const updatedColorCounts = snapshot.val() || {};
      setColorCounts(updatedColorCounts);
    });

    return () => {
      colorsRef.off('value');
    };
  }, [setColorCounts]);

  function createEmptyGrid() {
    const rows = 127;
    const cols = 134;
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

      db.ref(`cells/${userId}`).push({
        row,
        col,
        color: currentColor,
      });

      db.ref(`colors/${currentColor}`).transaction((currentCount) => {
        return (currentCount || 0) + 1;
      });

      // Не устанавливаем кулдаун и таймер, если уже установлены
      if (!cooldown) {
        setCooldown(true);
        setTimer(10);

        const interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer > 0) {
              localStorage.setItem('timer', prevTimer - 1);
              return prevTimer - 1;
            } else {
              clearInterval(interval);
              setCooldown(false);
              return 0;
            }
          });
        }, 1000);
      }
    }
  }

  function renderGrid() {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="row">
        {row.map((cellColor, colIndex) => (
          <div
            key={colIndex}
            className="cell"
            style={{
              backgroundColor: cellColor,
            }}
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
    <>
      <div className="container">
        <div className="App">
          <div id="color-buttons">
            {rainbowColors.map((color, index) => (
              <button
                key={index}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    selectedColor === color
                      ? '0px 5px 24px -5px rgba(0, 0, 0,1)'
                      : 'none',
                }}
                onClick={() => {
                  setCurrentColor(color);
                  setSelectedColor(color);
                }}
              ></button>
            ))}
          </div>
          <div id="timer">Таймер: {timer} сек.</div>
          <div id="content-container">
            <div
              id="color-counts"
              style={{ height: '300px', overflowY: 'scroll' }}
            >
              {[...usedColors].map((color, index) => (
                <p key={index}>
                  {color}: {colorCounts[color] || 0}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div id="grid-container">{renderGrid()}</div>
      </div>
    </>
  );
}

export default App;
