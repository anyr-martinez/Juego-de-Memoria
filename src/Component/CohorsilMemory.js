import React, { useState, useEffect, useCallback, useRef } from 'react';
import cohorsil from "../Assets/cohorsil.png";
import bayerLogo from "../Assets/BAYER.png"; // Importa el logo de Bayer
import syngenta from "../Assets/syngenta.png"; // Importa el logo de Syngenta

const MemoryGame = () => {
  // Preguntas y respuestas
  const qaPairs = React.useMemo(() => [
    { question: 'Roya y Ojo de Gallo', answer: 'Esfera Max', image: 'esferamax.png' },
    { question: 'Mancha de Hierro', answer: 'Nativo', image: 'nativo.png' },
    { question: 'Preventivo contra hongos de viveros de Café', answer: 'Antracol con Zinc ++', image: 'antracol2.png' },
    { question: 'Complemento Nutricional de Microelementos', answer: 'Bayfolan Forte', image: 'bayfolan.png' },
    { question: 'Plagas del Suelo(Gallina Ciega, Cochinilla)', answer: 'Confidor', image: 'confidor.png' },
    { question: 'Nematodos', answer: 'Verango', image: 'verango.png' },
    { question: 'Protección total desde la raíz', answer: 'Uniform', image: 'uniform.png' },
    { question: 'elimina larvas antes de eclosionar', answer:'Proclaim Opti', image: 'proclaim-opti.png' },
    { question: 'ácaros y minadores', answer: 'Vertimec', image: 'vertimec.png' },
    { question: 'oomicetos', answer: 'Orondis Ultra', image: 'orondis.png' },
    { question: 'Gusano Cogollero', answer: 'Ampligo 15 sc', image: 'ampligo.png'},
    { question: 'Control de Botritys', answer: 'Inspire Gold', image: 'inspire-gold.png' }, 
    { question: 'Insectos en el enves de las hojas', answer: 'Pegasus 50', image: 'pegasus.png' },
  ], []);

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeUp, setTimeUp] = useState(false);

  // Ref para limpiar timeouts de flip
  const flipTimeout = useRef(null);
  // Ref para saber si el juego está activo
  const gameActive = useRef(true);

  // Precargar imágenes para optimizar la carga visual
  useEffect(() => {
    qaPairs.forEach(pair => {
      if (pair.image) {
        const img = new window.Image();
        img.src = require(`../Assets/${pair.image}`);
      }
    });
  }, [qaPairs]);

  // Genera cartas
  const createCards = useCallback(() => {
  // 1. Tomar 6 productos aleatorios del banco
  const selectedPairs = [...qaPairs]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  // 2. Crear las cartas solo con esos 6
  let gameCards = [];
  selectedPairs.forEach((pair, idx) => {
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

  // 3. Mezclar las cartas en el tablero
  return gameCards.sort(() => Math.random() - 0.5);
}, [qaPairs]);

  // Inicializar juego
  const initGame = useCallback(() => {
    gameActive.current = false; // Desactiva el juego anterior
    if (flipTimeout.current) {
      clearTimeout(flipTimeout.current);
      flipTimeout.current = null;
    }
    const newCards = createCards();
    setCards(newCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameWon(false);
    setGamePaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setTimeLeft(60);
    setTimeUp(false);
    setTimeout(() => { gameActive.current = true; }, 0); // Activa el nuevo juego después de reiniciar el estado
  }, [createCards]);

  // Temporizador de cuenta regresiva
  useEffect(() => {
    let interval;
    if (startTime && !gameWon && !gamePaused && !timeUp) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimeUp(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon, gamePaused, timeUp]);

  // Click en carta
  const handleCardClick = (cardId) => {
    if (!gameActive.current) return;
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId) || gamePaused || gameWon || timeUp) return;

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
        flipTimeout.current = setTimeout(() => {
          if (!gameActive.current) return;
          setMatchedCards(prev => [...prev, card1.id, card2.id]);
          setFlippedCards([]);
        }, 600);
      } else {
        flipTimeout.current = setTimeout(() => {
          if (!gameActive.current) return;
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // Limpia timeout al desmontar el componente
  useEffect(() => {
    return () => {
      gameActive.current = false;
      if (flipTimeout.current) clearTimeout(flipTimeout.current);
    };
  }, []);

  // Limpia flippedCards y timeout cuando se acaba el tiempo
  useEffect(() => {
    if (timeUp) {
      if (flipTimeout.current) {
        clearTimeout(flipTimeout.current);
        flipTimeout.current = null;
      }
      setFlippedCards([]);
    }
  }, [timeUp]);

  // Limpia flippedCards y timeout cuando se gana el juego
  useEffect(() => {
    if (gameWon) {
      if (flipTimeout.current) {
        clearTimeout(flipTimeout.current);
        flipTimeout.current = null;
      }
      setFlippedCards([]);
    }
  }, [gameWon]);

  // Temporizador para mostrar el tiempo transcurrido (opcional, puedes quitarlo si solo quieres el countdown)
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
    let winTimeout;
    if (matchedCards.length === cards.length && cards.length > 0) {
      winTimeout = setTimeout(() => setGameWon(true), 800);
    }
    return () => {
      if (winTimeout) clearTimeout(winTimeout);
    };
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

  // PALETA DE COLORES DIFERENCIADA, NO MUY OSCURA NI MUY CLARA
  const pairColors = [
    'from-blue-700 to-blue-900',
    'from-cyan-500 to-cyan-700',
    'from-orange-500 to-orange-700',
    'from-purple-500 to-purple-700',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
  ];

  return (
    <div className="
      memory-container
      min-h-screen w-full flex items-start justify-center
      bg-gradient-to-br to-red-50 p-2 sm:p-4 md:py-8 overflow-x-hidden
    ">
      <div
        className={`flex flex-col items-center w-full max-w-[95vw] sm:max-w-[800px] lg:max-w-[1000px] mx-auto rounded-[2rem] bg-white/95 px-3 py-4 sm:px-5 sm:py-6 md:px-6 shadow-2xl transition-all duration-500
          ${gameWon ? 'mt-8' : 'mt-0 sm:mt-1 md:mt-2'}`}
        style={{ overflow: 'visible' }}
      >

        {/* Logos + título */}
       <div className="w-full grid grid-cols-[0.8fr_1.8fr_0.8fr] items-center gap-3 sm:gap-4 lg:gap-6 mb-8 py-3 px-1 sm:px-2 overflow-hidden">
            <div className="flex items-center justify-center">
              <img
                src={bayerLogo}
                alt="Bayer"
                className="w-14 h-10 sm:w-20 sm:h-14 lg:w-24 lg:h-16 object-contain max-w-full"
                style={{ maxWidth: '100%', maxHeight: '64px' }}
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={cohorsil}
                alt="COHORSIL"
                className="w-[24rem] h-32 sm:w-[31rem] sm:h-40 lg:w-[40rem] lg:h-52 object-contain max-w-full"
                style={{ maxWidth: '100%', maxHeight: '208px' }}
              />
            </div>
            <div className="flex items-center justify-center">
              <img
                src={syngenta}
                alt="Syngenta"
                className="w-20 h-10 sm:w-32 sm:h-14 lg:w-36 lg:h-16 object-contain max-w-full"
                style={{ maxWidth: '100%', maxHeight: '64px' }}
              />
            </div>
          </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center mb-1 transition-all duration-500">
          Memoria COHORSIL
        </h1>
        <p className="text-gray-600 italic text-center mt-1 text-lg sm:text-2xl md:text-3xl mb-4">
          ¡Somos innovación Agropecuaria!
        </p>

        {/* Cronómetro */}
        <div className="mb-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-100">
          <span className={`font-bold text-lg sm:text-2xl ${timeLeft <= 10 ? `text-red-600` : `text-blue-700`}`}>
            Tiempo Restante: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Mensaje victoria */}
        {gameWon && (
          <div className="mt-4 w-full flex justify-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg text-center shadow-lg animate-pulse w-full max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">🎉 ¡Felicitaciones! 🎉</h2>
              <p className="text-base sm:text-lg">Movimientos: {moves} | Tiempo: {formatTime(elapsedTime)}</p>
            </div>
          </div>
        )}

        {/* Mensaje tiempo agotado */}
        {timeUp && !gameWon && (
          <div className="mt-4 w-full flex justify-center">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg text-center shadow-lg animate-pulse w-full max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">⏰ ¡Tiempo agotado!</h2>
            </div>
          </div>
        )}

        {/* Tablero */}
        <div
          className="w-full rounded-[1.5rem] bg-white shadow-inner p-2 sm:p-4 md:p-6 flex items-center justify-center mx-auto mt-6 mb-10 ring-1 ring-red-100"
        >
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 w-full mx-auto">

            {cards.map(card => {
              const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);

              let matchedPairColor = '';
              if (isMatched) {
                matchedPairColor = pairColors[card.pairId % pairColors.length];
              }

              return (
                <div
                  key={card.id}
                  onClick={() => !timeUp && handleCardClick(card.id)}
                  className={`
                    w-full aspect-square min-w-0 rounded-lg cursor-pointer transition-all duration-500 flex items-center justify-center
                    text-xs sm:text-sm md:text-lg lg:text-2xl xl:text-3xl font-bold shadow whitespace-pre-line break-words text-center
                    ${isFlipped
                      ? isMatched
                        ? `bg-gradient-to-br ${matchedPairColor} text-white`
                        : 'bg-gradient-to-br from-green-600 to-green-800 text-white'
                      : 'bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white'}
                    ${isMatched ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
                    ${timeUp && !isMatched ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  style={{
                    pointerEvents: gamePaused || gameWon || timeUp ? 'none' : 'auto',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  {isFlipped ? (
                    card.isQuestion ? (
                      <span className="block w-full px-1 py-1 sm:px-2 sm:py-2 text-[11px] sm:text-sm md:text-lg lg:text-xl font-bold text-center leading-tight break-words whitespace-pre-line text-white" style={{wordBreak:'break-word', overflowWrap:'break-word', hyphens:'auto'}}>
                        {card.text}
                      </span>
                    ) : (
                      card.image ? (
                        <div className="flex flex-col items-center w-full h-full justify-center p-1 sm:p-2">
                          <img
                            src={require(`../Assets/${card.image}`)}
                            alt={card.text}
                            className="w-[82%] h-[54%] sm:w-[86%] sm:h-[60%] md:w-[90%] md:h-[68%] object-contain mx-auto block rounded-lg"
                            style={{display:'block', margin:'0 auto'}}
                          />
                          <span
                            className="block mt-1 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-white drop-shadow-md text-center w-full whitespace-normal break-words"
                            style={{
                              lineHeight: '1.1',
                              maxWidth: '95%',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word',
                              hyphens: 'auto',
                              display: 'block'
                            }}
                          >
                            {card.text}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base sm:text-xl md:text-2xl font-bold text-white">{card.text}</span>
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
        <div className="flex flex-col items-center w-full max-w-xs mx-auto mt-2 mb-6 sm:mb-8">
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
