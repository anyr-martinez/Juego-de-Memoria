import React, { useState, useEffect, useCallback } from 'react';
import logo from "../Assets/logo2.png";

const MemoryGame = () => {

  // Preguntas y respuestas
  const qaPairs = React.useMemo(() => [
    { question: 'Royal', answer: 'Esfera Max', image: 'esfera.png' },
    { question: 'Tizón Tardío', answer: 'Orondis', image: 'orondis.png' },
    { question: 'Nematodos', answer: 'Verango', image: 'verango.png' },
    { question: 'Deficiencia de Calcio', answer: 'Metalosote Calcio', image: 'metalosote.png' },
    { question: 'Botrytis', answer: 'Miravis', image: 'miravis.png' },
    { question: 'Control del Estrés de la Planta', answer: 'Everest', image: 'everest.png' },
    { question: 'Mosca Blanca', answer: 'Pecuseta', image: 'pecuseta.png' },
    { question: 'Acidez del Suelo', answer: 'Acical', image: 'acical.png' },
  ], []);

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Genera cartas
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
    setStartTime(null);
    setElapsedTime(0);
  }, [createCards]);

  // Click en carta
  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId) || gamePaused || gameWon) return;

    if (flippedCards.length === 0 && startTime === null) {
      setStartTime(Date.now());
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const card1 = cards.find(c => c.id === newFlipped[0]);
      const card2 = cards.find(c => c.id === newFlipped[1]);

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
  <div className="
    memory-container
    min-h-screen w-full flex items-center justify-center
    bg-gradient-to-br to-red-50 p-2 sm:p-4 overflow-x-hidden
  ">
  <div className="flex flex-col items-center w-full max-w-full mx-auto mt-8 sm:mt-12 md:mt-16">

      {/* Logo + título */}
      <img src={logo} alt="Logo Cohorsil"
        className="h-32 w-56 sm:h-40 sm:w-72 md:h-52 md:w-[22rem] mb-6 object-contain" />
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 text-center mb-2">
        Memoria COHORSIL
      </h1>
      <p className="text-gray-600 italic text-center mt-1 text-lg sm:text-2xl md:text-3xl mb-4">
        ¡Somos innovación Agropecuaria!
      </p>

      {/* Mensaje victoria */}
      {gameWon && (
        <div className="mt-4 w-full flex justify-center">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg text-center shadow-lg animate-pulse w-full max-w-xs">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">🎉 ¡Felicitaciones! 🎉</h2>
            <p className="text-lg sm:text-xl mb-2">¡Has completado el juego de memoria COHORSIL!</p>
            <p className="text-base sm:text-lg">Movimientos: {moves} | Tiempo: {formatTime(elapsedTime)}</p>
          </div>
        </div>
      )}

      {/* Tablero */}
      <div
        className="bg-white rounded-lg shadow-inner p-4 sm:p-6 flex items-center justify-center mx-auto mt-8 mb-8
                   w-full max-w-[98vw] sm:max-w-[800px] lg:max-w-[1100px]"
        style={{
          height: 'min(98vw, 85vh, 900px)',
          aspectRatio: '1/1',
        }}
      >
  <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full h-full">
          {cards.map(card => {
            const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
            const isMatched = matchedCards.includes(card.id);

            const pairColors = [
              'from-blue-400 to-blue-500',
              'from-green-600 to-green-600',
              'from-yellow-400 to-yellow-500',
              'from-pink-400 to-pink-500',
              'from-purple-400 to-purple-500',
              'from-orange-400 to-orange-500',
              'from-teal-400 to-teal-500',
              'from-cyan-400 to-cyan-500',
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
                  aspect-square rounded-lg cursor-pointer transition-all duration-500 flex items-center justify-center
                  text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold shadow p-2 sm:p-4
                  whitespace-pre-line break-words text-center
                  ${isFlipped
                    ? isMatched
                      ? `bg-gradient-to-br ${matchedPairColor} text-white`
                      : 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                    : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white'}
                  ${isMatched ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
                `}
                style={{ pointerEvents: gamePaused || gameWon ? 'none' : 'auto', minWidth: '200px', minHeight: '170px', wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isFlipped ? (
                  card.isQuestion ? (
                    <span className="block w-full px-2 py-2 text-base sm:text-xl md:text-2xl font-bold text-center leading-tight break-words whitespace-pre-line" style={{wordBreak:'break-word', overflowWrap:'break-word', hyphens:'auto'}}>
                      {card.text}
                    </span>
                  ) : (
                    card.image ? (
                      <img
                        src={require(`../Assets/${card.image}`)}
                        alt={card.text}
                        className="w-[98%] h-[98%] object-cover mx-auto block rounded-lg"
                        style={{display:'block', margin:'0 auto'}}
                      />
                    ) : (
                      <span className="text-base sm:text-xl md:text-2xl font-bold">{card.text}</span>
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

      {/* Botón */}
      <div className="flex flex-col items-center w-full max-w-xs mx-auto mb-8">
        <button
          onClick={initGame}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                     text-white font-bold py-4 px-6 sm:py-5 sm:px-10 rounded-full transition 
                     transform hover:scale-105 shadow-lg w-full text-lg sm:text-2xl md:text-3xl"
        >
          🔄 Nuevo Juego
        </button>
      </div>
    </div>
  </div>
);
};

export default MemoryGame;
