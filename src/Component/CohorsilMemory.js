import React, { useState, useEffect, useCallback } from 'react';
import logo from "../Assets/logo2.png";

const MemoryGame = () => {
  const symbols = [
    '🌾', '☕', '🏆', '🌽', '🫘', '🐔', '🌱', '🥕',
    '🍅', '🌿', '🌍', '🥦', '🌳', '🍃', '🌻', '🏔️',
    '🌶️', '🥬', '🌰', '🥒', '📦', '🍒', '🏚️', '🥕',
    '🧺', '🌙', '🌾', '☘️', '🧑‍🌾', '⭐', '🌸', '💰'
  ];

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const createCards = () => {
    const gameCards = [];
    for (let i = 0; i < 32; i++) {
      const symbol = symbols[i];
      gameCards.push({ id: i * 2, symbol, matched: false });
      gameCards.push({ id: i * 2 + 1, symbol, matched: false });
    }
    return gameCards.sort(() => Math.random() - 0.5);
  };

  const initGame = useCallback(() => {
    const newCards = createCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameWon(false);
    setGamePaused(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (matchedCards.includes(cardId)) return;
    if (gamePaused || gameWon) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      const card1 = cards.find(card => card.id === newFlippedCards[0]);
      const card2 = cards.find(card => card.id === newFlippedCards[1]);

      if (card1.symbol === card2.symbol) {
        setTimeout(() => {
          setMatchedCards([...matchedCards, card1.id, card2.id]);
          setFlippedCards([]);
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (startTime && !gameWon && !gamePaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon, gamePaused]);

  useEffect(() => {
    if (matchedCards.length === 64 && matchedCards.length > 0) {
      setGameWon(true);
      setGamePaused(false);
    }
  }, [matchedCards]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br to-red-50 p-4">
      <div className="max-w-6xl">
        {gamePaused && !gameWon && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-6 rounded-lg text-center mb-6 shadow-lg animate-pulse">
              <h2 className="text-3xl font-bold mb-2">⏸️ Juego en pausa</h2>
              <p className="text-xl mb-2">El juego ha sido pausado.</p>
              <p className="text-lg">Presiona "Nuevo Juego" para reiniciar.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col mb-6 bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between w-full mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <img src={logo} alt="Logo Cohorsil" className="h-25 w-25 ml-40" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 ml-8">Memoria COHORSIL</h1>
                <p className="text-gray-600 italic text-center ml-4">¡Somos innovación Agropecuaria!</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-10 mb-3 justify-center w-full">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow">
                Movimientos: {moves}
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow">
                Tiempo: {formatTime(elapsedTime)}
              </div>
              <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow">
                Parejas: {matchedCards.length / 2}/32
              </div>
            </div>
          </div>

          {gameWon && (
            <div className="w-full">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg text-center mb-6 shadow-lg animate-pulse w-full">
                <h2 className="text-3xl font-bold mb-2">🎉 ¡Felicitaciones! 🎉</h2>
                <p className="text-xl mb-2">¡Has completado el juego de memoria COHORSIL!</p>
                <p className="text-lg">
                  Movimientos: {moves} | Tiempo: {formatTime(elapsedTime)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-inner p-2">
            <div className="grid grid-cols-8 gap-1 max-w-xl mx-auto">
              {cards.map((card) => {
                const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
                const isMatched = matchedCards.includes(card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-square rounded-lg cursor-pointer transition-all duration-500 flex items-center justify-center text-2xl font-bold shadow
                      ${isFlipped
                        ? isMatched
                          ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                          : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                        : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white'}
                      ${isMatched ? 'ring-4 ring-green-300 ring-opacity-50' : ''}
                    `}
                    style={{ pointerEvents: gamePaused || gameWon ? 'none' : 'auto' }}
                  >
                    {isFlipped ? (
                      <span className="transform transition-transform duration-300 hover:scale-110">
                        {card.symbol}
                      </span>
                    ) : (
                      <span className="text-lg font-black"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex justify-end gap-4 mb-6">
          <button
            onClick={initGame}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-full transition transform hover:scale-105 shadow-lg"
          >
            🔄 Nuevo Juego
          </button>
          <button
            onClick={() => setGamePaused(true)}
            className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-full transition transform hover:scale-105 shadow-lg"
            disabled={gameWon || gamePaused}
          >
            ⏸️ Parar Juego
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
