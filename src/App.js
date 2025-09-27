// Project: subway-surf-clone
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  return (
    <div className="sidi">
      <h1 className="didi">Subway Surf Clone — Enhanced</h1>
      <div className="app-root">
        <Game />
      </div>
    </div>
  );
}

function Game() {
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);

  const lastYRef = useRef(-50);
  const speedRef = useRef(4);
  const obstaclesRef = useRef([]);
  const coinsRef = useRef([]);

  const musicRef = useRef(null);
  const jumpRef = useRef(null);
  const coinRef = useRef(null);

  // sync refs
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  // controls (keyboard)
  useEffect(() => {
    const handler = (e) => {
      if (!running || paused) return;
      if (e.key === "ArrowLeft" && playerLane > 0) {
        setPlayerLane((p) => p - 1);
        playJump();
      } else if (e.key === "ArrowRight" && playerLane < 2) {
        setPlayerLane((p) => p + 1);
        playJump();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playerLane, running, paused]);

  const moveLeft = () => {
    if (!running || paused) return;
    if (playerLane > 0) {
      setPlayerLane((p) => p - 1);
      playJump();
    }
  };
  const moveRight = () => {
    if (!running || paused) return;
    if (playerLane < 2) {
      setPlayerLane((p) => p + 1);
      playJump();
    }
  };

  // sounds
  useEffect(() => {
    musicRef.current = new Audio(process.env.PUBLIC_URL + "/sounds/crash.mp3");
    musicRef.current.loop = true;
    musicRef.current.volume = 0.4;
    jumpRef.current = new Audio(process.env.PUBLIC_URL + "/sounds/jump.wav");
    coinRef.current = new Audio(process.env.PUBLIC_URL + "/sounds/coin.wav");

    const tryPlay = async () => {
      try {
        await musicRef.current.play();
      } catch (e) {}
    };
    tryPlay();

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  const playJump = () => {
    if (jumpRef.current) {
      jumpRef.current.currentTime = 0;
      jumpRef.current.play();
    }
  };
  const playCoin = () => {
    if (coinRef.current) {
      coinRef.current.currentTime = 0;
      coinRef.current.play();
    }
  };

  // spawn items
  useEffect(() => {
    if (!running || paused) return;
    const spawn = setInterval(() => {
      const lane = Math.floor(Math.random() * 3);
      const isCoin = Math.random() < 0.5;
      const gap = 50 + Math.floor(Math.random() * 70);

      lastYRef.current = lastYRef.current - gap;

      const item = { id: Date.now() + Math.random(), lane, y: lastYRef.current };

      if (isCoin) setCoins((c) => [...c, item]);
      else setObstacles((o) => [...o, item]);
    }, 1200);

    return () => clearInterval(spawn);
  }, [running, paused]);

  // update speed
  useEffect(() => {
    speedRef.current = 8 + Math.floor(score / 20); // سرعة متدرجة واقعية
  }, [score]);

  // helper function: collision detection
  function isColliding(obj, playerLane) {
    const objTop = obj.y;
    const objBottom = obj.y + 50; // ارتفاع تقريبي
    const objLeft = obj.lane * 130 + 20;
    const objRight = objLeft + 50;

    const playerTop = 450;
    const playerBottom = playerTop + 64;
    const playerLeft = playerLane * 130 + 20;
    const playerRight = playerLeft + 64;

    return !(
      objBottom < playerTop ||
      objTop > playerBottom ||
      objRight < playerLeft ||
      objLeft > playerRight
    );
  }

  // game loop
  useEffect(() => {
    if (!running || paused) return;

    const id = setInterval(() => {
      setObstacles((obs) =>
        obs.map((o) => ({ ...o, y: o.y + speedRef.current })).filter((o) => o.y < 600)
      );
      setCoins((cs) =>
        cs.map((c) => ({ ...c, y: c.y + speedRef.current })).filter((c) => c.y < 600)
      );

      // collision with obstacle
      obstaclesRef.current.forEach((o) => {
        if (isColliding(o, playerLane)) {
          setRunning(false);
          alert(`Game Over! Final Score: ${score} | Coins: ${coinsCollected}`);
        }
      });

      // collision with coin
      coinsRef.current.forEach((c) => {
        if (isColliding(c, playerLane)) {
          setCoins((cs) => cs.filter((coin) => coin.id !== c.id));
          setCoinsCollected((cc) => cc + 1);
          playCoin();
        }
      });

      setScore((s) => s + 1);
    }, 50); // فريم ريت أسرع علشان الحركة أنعم

    return () => clearInterval(id);
  }, [running, paused, playerLane, score, coinsCollected]);

  return (
    <div className="game-area">
      {/* player */}
      <div className="player" style={{ left: playerLane * 130 + 20, top: 450 }}>
        <img
          src={process.env.PUBLIC_URL + "/assets/player-sprite.png"}
          alt="player"
          style={{ width: 64, height: 64 }}
        />
      </div>

      {/* obstacles */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="obstacle"
          style={{ top: o.y, left: o.lane * 130 + 20 }}
        >
          <img src={process.env.PUBLIC_URL + "/assets/obstacle.png"} alt="obstacle" />
        </div>
      ))}

      {/* coins */}
      {coins.map((c) => (
        <div
          key={c.id}
          className="coin"
          style={{ top: c.y, left: c.lane * 130 + 20 }}
        >
          <img src={process.env.PUBLIC_URL + "/assets/coin.png"} alt="coin" />
        </div>
      ))}

      <div className="hud">
        <p>Score: {score}</p>
        <p>Coins: {coinsCollected}</p>

        <div className="hud-buttons">
          <button onClick={() => setRunning((r) => !r)}>
            {running ? "⏸ " : "▶️ "}
          </button>
          <button
            onClick={() => {
              setPlayerLane(1);
              setObstacles([]);
              setCoins([]);
              setScore(0);
              setCoinsCollected(0);
              lastYRef.current = -30;
              setRunning(true);
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* controls */}
      <div className="controls">
        <button onClick={moveLeft}>⬅️</button>
        <button onClick={moveRight}>➡️</button>
      </div>
    </div>
  );
}
