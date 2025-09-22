import React, { useState, useEffect, useCallback } from 'react';
import logo from "../Assets/logo2.png";

const MemoryGame = () => {

  // Preguntas y respuestas
  const qaPairs = React.useMemo(() => [
    { question: 'Royal', answer: 'Esfera Max', image: 'esfera-max.png' },
    { question: 'Tizón Tardío', answer: 'Orondis', image: 'orondis.png' },
    { question: 'Nematodos', answer: 'Verango', image: 'verango.png' },
    { question: 'Deficiencia de Calcio', answer: 'Metal', image: 'metal.png' },
    { question: 'Miravis', answer: 'Botritis', image: 'botritis.png' },
    { question: 'Control del Estrés  de la Planta', answer: 'Hebredes', image: 'hebredes.png' },
    { question: 'Mosca Blanca', answer: 'Pecuseta', image: 'pecuseta.png' },
    { question: 'Acidez del Suelo', answer: 'Asical', image: 'asical.png' },
  ], []);

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Genera las cartas: 8 pares Pregunta ↔ Respuesta
  const createCards = useCallback(() => {
    let gameCards = [];
    qaPairs.forEach((pair, idx) => {
      gameCards.push({
        id: idx * 2,
        text: pair.question,
        pairId: idx,
        isQuestion: true,
        image: null,
      });
      gameCards.push({
        id: idx * 2 + 1,
        text: pair.answer,
        pairId: idx,
        isQuestion: false,
        image: pair.image,
      });
    });
    return gameCards.sort(() => Math.random() - 0.5);
  }, [qaPairs]);

  // Inicializar juego
  const initGame = useCallback(() => {
    const newCards = createCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameWon(false);
    setGamePaused(false);
    setStartTime(null); // No iniciar el tiempo aún
    setElapsedTime(0);
  }, [createCards]);

  // Manejo de clic en cartas
  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId) || gamePaused || gameWon) return;

    // Iniciar el tiempo al voltear la primera carta
    if (flippedCards.length === 0 && startTime === null) {
      setStartTime(Date.now());
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards.find(c => c.id === newFlipped[0]);
      const card2 = cards.find(c => c.id === newFlipped[1]);

      // Match correcto si son pareja y uno pregunta, otro respuesta
      if (card1.pairId === card2.pairId && card1.isQuestion !== card2.isQuestion) {
        setTimeout(() => {
          setMatchedCards(prev => [...prev, card1.id, card2.id]);
          setFlippedCards([]);
        }, 600);
      } else {
        setTimeout(() => setFlippedCards([]), 800);
      }
    }
  };

  // Temporizador
  useEffect(() => {
    let interval;
    if (startTime && !gameWon && !gamePaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon, gamePaused]);

  // Comprobar victoria
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimeout(() => setGameWon(true), 800);
    }
  }, [matchedCards, cards]);

  useEffect(() => {
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };



  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br to-red-50 p-4">
      <div className="w-full max-w-full mx-auto">
  <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-8 gap-2 sm:gap-4 items-center justify-center absolute top-0 left-0 w-full h-full max-w-[700px] xl:max-w-[1100px] 2xl:max-w-[1800px] mx-auto md:relative md:h-auto md:min-h-screen">

          
          {/* Panel lateral izquierdo */}
          <div className="flex flex-col items-center w-full md:w-72 relative md:-mt-20 md:ml-20 mb-4 md:mb-0">
            <img src={logo} alt="Logo Cohorsil" className="h-16 w-32 sm:h-20 sm:w-40 md:h-24 md:w-60 mb-1 object-contain" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mt-1">Memoria COHORSIL</h1>
            <p className="text-gray-600 italic text-center mt-1 text-sm sm:text-base md:text-lg">¡Somos innovación Agropecuaria!</p>

            {/* Mensaje de victoria */}
            {gameWon && (
              <div className="mt-10 w-full flex justify-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg text-center shadow-lg animate-pulse w-full max-w-xs">
                  <h2 className="text-3xl font-bold mb-2">🎉 ¡Felicitaciones! 🎉</h2>
                  <p className="text-xl mb-2">¡Has completado el juego de memoria COHORSIL!</p>
                  <p className="text-lg">Movimientos: {moves} | Tiempo: {formatTime(elapsedTime)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tablero 4x4 */}
          <div className="bg-white rounded-lg shadow-inner p-2 w-full max-w-[600px] h-[80vw] max-h-[80vh] min-h-[340px] sm:min-h-[400px] md:w-[600px] md:h-[600px] 2xl:w-[1200px] 2xl:h-[1200px] flex items-center justify-center mx-auto mt-2 md:-mt-26 md:ml-10">
            <div className="grid grid-cols-4 gap-6 w-full h-full">
              {cards.map(card => {
                const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
                const isMatched = matchedCards.includes(card.id);

                // Paleta de colores pastel para parejas
                const pairColors = [
                  'from-blue-400 to-blue-500',
                  'from-green-400 to-green-500',
                  'from-yellow-400 to-yellow-500',
                  'from-pink-400 to-pink-500',
                  'from-purple-400 to-purple-500',
                  'from-orange-400 to-orange-500',
                  'from-teal-400 to-teal-500',
                  'from-cyan-400 to-cyan-500',
                  'from-lime-400 to-lime-500',
                  'from-indigo-400 to-indigo-500',
                  'from-fuchsia-400 to-fuchsia-500',
                  'from-amber-400 to-amber-500',
                  'from-emerald-400 to-emerald-500',
                  'from-sky-400 to-sky-500',
                  'from-violet-400 to-violet-500',
                  'from-rose-400 to-rose-500',
                ];
                let matchedPairColor = '';
                if (isMatched) {
                  matchedPairColor = pairColors[card.pairId % pairColors.length];
                }
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`
                      aspect-square rounded-lg cursor-pointer transition-all duration-500 flex items-center ${card.text === 'Nematodos' && card.isQuestion ? 'justify-start' : 'justify-center'} text-base sm:text-lg md:text-xl lg:text-2xl font-bold shadow p-2 ${card.text === 'Nematodos' && card.isQuestion ? 'text-left' : 'text-center'}
                      ${isFlipped
                        ? isMatched
                          ? `bg-gradient-to-br ${matchedPairColor} text-white`
                          : 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                        : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white'}
                      ${isMatched ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
                    `}
                    style={{ pointerEvents: gamePaused || gameWon ? 'none' : 'auto', minWidth: '140px', minHeight: '90px', wordBreak: 'break-word' }}
                  >
                    {isFlipped ? (
                      card.isQuestion ? (
                        <span
                          className={`transform transition-transform duration-300 hover:scale-105 block w-full px-1 py-1 text-lg sm:text-xl md:text-2xl font-bold whitespace-pre-line ${card.text === 'Nematodos' ? 'text-left' : 'text-center'}`}
                          style={{ wordBreak: 'normal', lineHeight: '1.25', hyphens: 'auto' }}
                        >
                          {card.text}
                        </span>
                      ) : (
                        card.image ? (
                          <img
                            src={require(`../Assets/${card.image}`)}
                            alt={card.text}
                            className="w-32 h-32 object-contain mx-auto"
                          />
                        ) : (
                          <span className="text-lg sm:text-xl md:text-2xl font-bold">{card.text}</span>
                        )
                      )
                    ) : (
                      <span className="text-lg font-black"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón a la derecha */}
          <div className="flex flex-col items-end flex-1 mr-0 md:mr-20 mt-4 md:mt-0 w-full md:w-auto">
            <button
              onClick={initGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition transform hover:scale-105 shadow-lg w-full md:w-auto text-base sm:text-lg md:text-xl"
            >
              🔄 Nuevo Juego
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
