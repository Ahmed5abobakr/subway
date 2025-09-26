// Project: subway-surf-clone
// React + simple assets (images + sounds)

import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// ---------- ASSETS (place in public/assets/)
// player-sprite.png, obstacle.png, coin.png, bg-music.mp3, jump.wav, coin.wav

export default function App() {
  return (
    <div className="app-root">
      <h1>Subway Surf Clone — Enhanced</h1>
      <Game />
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

  const musicRef = useRef(null);
  const jumpRef = useRef(null);
  const coinRef = useRef(null);

  // controls
  useEffect(() => {
    const handler = (e) => {
      if (!running) return;
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
  }, [playerLane, running]);

    const moveLeft = () => {
    if (!running) return;
    if (playerLane > 0) {
      setPlayerLane((p) => p - 1);
      playJump();
    }
  };
    const moveRight = () => {
    if (!running) return;
    if (playerLane < 2) {
      setPlayerLane((p) => p + 1);
      playJump();
    }
  };
  // load sounds
  useEffect(() => {
    musicRef.current = new Audio(
      process.env.PUBLIC_URL + "/sounds/crash.mp3"
    );
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
    if (!running) return;
    const spawn = setInterval(() => {
      const lane = Math.floor(Math.random() * 3);
      const isCoin = Math.random() < 0.5;
      const item = { id: Date.now() + Math.random(), lane, y: 0 };
      if (isCoin) setCoins((c) => [...c, item]);
      else setObstacles((o) => [...o, item]);
    }, 900);

    return () => clearInterval(spawn);
  }, [running]);

  // movement + collision
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setObstacles((obs) =>
        obs.map((o) => ({ ...o, y: o.y + 5 })).filter((o) => o.y < 600)
      );
      setCoins((cs) =>
        cs.map((c) => ({ ...c, y: c.y + 5 })).filter((c) => c.y < 600)
      );

      // collision with obstacle
      obstacles.forEach((o) => {
        if (o.lane === playerLane && o.y > 450 && o.y < 500) {
          setRunning(false);
          alert(
            "Game Over! Final Score: " + score + " | Coins: " + coinsCollected
          );
        }
      });

      // collision with coin
      const gotCoin = coins.find(
        (c) => c.lane === playerLane && c.y > 450 && c.y < 500
      );
      if (gotCoin) {
        setCoins((cs) => cs.filter((c) => c.id !== gotCoin.id));
        setCoinsCollected((cc) => cc + 1);
        playCoin();
      }

      setScore((s) => s + 1);
    }, 100);

    return () => clearInterval(id);
  }, [running, obstacles, coins, playerLane, score, coinsCollected]);

  return (
    <div className="game-area">
      {/* player */}
      {/* player test */}
      <div className="player" style={{ left: playerLane * 100 + 50, top: 450 }}>
        <img
          src="/assets/player-sprite.png"
          alt="player"
          style={{ width: 64, height: 64 }}
        />
      </div>

      {/* obstacles */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="obstacle"
          style={{ top: o.y, left: o.lane * 100 + 50 }}
        >
          <img
            src={process.env.PUBLIC_URL + "/assets/obstacle.png"}
            alt="obstacle"
          />
        </div>
      ))}

      {/* coins */}
      {coins.map((c) => (
        <div
          key={c.id}
          className="coin"
          style={{ top: c.y, left: c.lane * 100 + 50 }}
        >
          <img src={process.env.PUBLIC_URL + "/assets/coin.png"} alt="coin" />
        </div>
      ))}

      <div className="hud">
        <p>Score: {score}</p>
        <p>Coins: {coinsCollected}</p>
      </div>
            {/* on-screen controls */}
      <div className="controls">
        <button onClick={moveLeft}>⬅️</button>
        <button onClick={moveRight}>➡️</button>
      </div>
    </div>
  );
}
