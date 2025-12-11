import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Award, Clock, Move, Grid3X3, ArrowRight, Star, Lock, BookOpen } from 'lucide-react';
import Board from './components/Board';
import { Theme, Level } from './types';
import { shuffleGrid, canMove, checkWin } from './services/gameLogic';
import { generateVictoryMessage } from './services/geminiService';

// --- CONFIGURATION ---

const LEVELS: Level[] = [
  { level: 1, gridSize: 2, name: "Uppvärmning", description: "Lär dig hur brickorna rör sig", parMoves: 8 },
  { level: 2, gridSize: 3, name: "Klassikern", description: "Det klassiska 3x3 pusslet", parMoves: 25 },
  { level: 3, gridSize: 4, name: "Utmanaren", description: "Nu börjar det bli klurigt", parMoves: 60 },
  { level: 4, gridSize: 5, name: "Experten", description: "Kräver tålamod och fokus", parMoves: 120 },
  { level: 5, gridSize: 6, name: "Mästaren", description: "Endast för de envisa", parMoves: 200 },
  { level: 6, gridSize: 8, name: "Geniet", description: "Den ultimata utmaningen", parMoves: 400 },
];

const THEMES: Theme[] = [
  { 
    id: 'nature', 
    name: 'Räv', 
    imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?q=80&w=1600&auto=format&fit=crop' 
  },
  { 
    id: 'space', 
    name: 'Rymd', 
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1600&auto=format&fit=crop' 
  },
  { 
    id: 'neon', 
    name: 'Neon City', 
    imageUrl: 'https://images.unsplash.com/photo-1565523992080-6927918a5df9?q=80&w=1600&auto=format&fit=crop' 
  },
  { 
    id: 'abstract', 
    name: 'Konst', 
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1600&auto=format&fit=crop' 
  },
  { 
    id: 'tech', 
    name: 'Cyber', 
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop' 
  },
];

const App: React.FC = () => {
  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState<number>(-1);
  const [moves, setMoves] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [victoryMessage, setVictoryMessage] = useState<string>("");
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const currentLevel = LEVELS[currentLevelIndex];

  // Initialize Game
  const startNewGame = useCallback((levelIndex: number) => {
    // Stop any existing timer
    if (timerRef.current) window.clearInterval(timerRef.current);

    const level = LEVELS[levelIndex];
    const size = level.gridSize;
    
    // Scale shuffle complexity with level size. 
    // Small grids need less shuffling to be solvable but not instant.
    const shuffleSteps = size === 2 ? 10 : size * 25;

    const { tiles: newTiles, emptyIndex: newEmpty } = shuffleGrid(size, shuffleSteps);
    
    setCurrentLevelIndex(levelIndex);
    setTiles(newTiles);
    setEmptyIndex(newEmpty);
    setMoves(0);
    setTimeElapsed(0);
    setIsSolved(false);
    setIsPlaying(true);
    setVictoryMessage("");
    setStarsEarned(0);

    // Start Timer
    timerRef.current = window.setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  // First load
  useEffect(() => {
    startNewGame(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Tile Click
  const handleTileClick = (index: number) => {
    if (isSolved || !isPlaying) return;

    if (canMove(index, emptyIndex, currentLevel.gridSize)) {
      const newTiles = [...tiles];
      // Swap
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = currentLevel.gridSize * currentLevel.gridSize - 1; // Set old pos to empty value

      setTiles(newTiles);
      setEmptyIndex(index);
      setMoves((prev) => prev + 1);

      // Check Win
      if (checkWin(newTiles)) {
        handleWin();
      }
    }
  };

  const handleWin = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIsSolved(true);
    setIsPlaying(false);
    
    // Calculate Stars
    const par = currentLevel.parMoves;
    let stars = 1;
    if (moves <= par) stars = 3;
    else if (moves <= par * 1.5) stars = 2;
    setStarsEarned(stars);

    // Trigger Gemini for victory message
    setIsLoadingMessage(true);
    generateVictoryMessage(currentLevel.gridSize, timeElapsed, moves + 1)
      .then(msg => {
        setVictoryMessage(msg);
        setIsLoadingMessage(false);
      });
  };

  const nextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      startNewGame(currentLevelIndex + 1);
    } else {
      // Loop back or stay? Let's just restart last level for now or go to menu.
      // Replaying extreme level is usually what people want.
      startNewGame(currentLevelIndex);
    }
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-900 select-none">
      
      {/* Dynamic Immersive Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out transform scale-105"
        style={{
          backgroundImage: `url(${currentTheme.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/50"></div>
      </div>

      <div className="max-w-md w-full flex flex-col gap-6 relative z-10">
        
        {/* Header with Level Progress */}
        <header className="flex flex-col gap-4 border-b border-white/10 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-cyan-200 tracking-tight drop-shadow-sm">
                MindSlide
              </h1>
              <p className="text-slate-300 text-sm font-medium flex items-center gap-1">
                 <BookOpen size={14} className="text-indigo-400"/> Skolappar.com
              </p>
            </div>
            <button 
              onClick={() => startNewGame(currentLevelIndex)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/10 active:scale-95"
              title="Starta om nivån"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Level Progress Indicator */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Nivå {currentLevel.level}</span>
              <span>{currentLevel.name}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${((currentLevelIndex + 1) / LEVELS.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Game Stats & Board Wrapper */}
        <div className="relative">
          
          {/* Active Game Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 flex items-center justify-between px-4 border border-white/10 shadow-lg">
                <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                  <Clock size={14} /> Tid
                </span>
                <span className="text-xl font-mono text-cyan-200 font-bold">{formatTime(timeElapsed)}</span>
             </div>
             <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3 flex items-center justify-between px-4 border border-white/10 shadow-lg">
                <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-2">
                  <Move size={14} /> Drag
                </span>
                <span className="text-xl font-mono text-indigo-200 font-bold">{moves}</span>
             </div>
          </div>

          <Board 
            tiles={tiles} 
            size={currentLevel.gridSize} 
            emptyIndex={emptyIndex} 
            onMove={handleTileClick} 
            imageUrl={currentTheme.imageUrl}
            isSolved={isSolved}
          />
          
          {/* Victory / Level Complete Overlay */}
          {isSolved && (
            <div className="absolute inset-0 z-20 flex items-end justify-center pb-6">
              <div className="w-[110%] -ml-[5%] bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 text-center animate-in slide-in-from-bottom-10 fade-in duration-500 shadow-2xl">
                 
                 {/* Star Rating */}
                 <div className="flex justify-center gap-2 mb-4">
                   {[1, 2, 3].map((star) => (
                     <Star 
                       key={star} 
                       size={32} 
                       className={`${star <= starsEarned ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} drop-shadow-lg transition-all duration-700 delay-${star*100}`} 
                     />
                   ))}
                 </div>

                 <h3 className="text-3xl font-extrabold text-white mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                   {currentLevelIndex === LEVELS.length - 1 ? "Pusselmästare!" : "Bra jobbat!"}
                 </h3>
                 
                 <p className="text-slate-400 text-sm mb-6 min-h-[20px] font-medium leading-relaxed px-4">
                   {isLoadingMessage ? "Beräknar resultat..." : victoryMessage}
                 </p>

                 <button
                   onClick={nextLevel}
                   className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transform transition-all active:scale-95 group"
                 >
                   {currentLevelIndex < LEVELS.length - 1 ? (
                     <>
                       NÄSTA NIVÅ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   ) : (
                     <>
                        SPELA IGEN <RotateCcw size={20} />
                     </>
                   )}
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Selector (Footer) */}
        <div className="flex flex-col gap-3 pt-2">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-500"></span> Välj Motiv
          </label>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setCurrentTheme(theme);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  currentTheme.id === theme.id 
                    ? 'border-indigo-400 scale-105 shadow-md shadow-black/50 ring-1 ring-indigo-500/30' 
                    : 'border-white/5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                }`}
              >
                <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-slate-400">
             Koppla av, fokusera, lär.
          </p>
        </div>

      </div>
    </div>
  );
};

export default App;