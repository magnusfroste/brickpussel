import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Award, Clock, Move, Grid3X3, ArrowRight, Star, Lock, BookOpen, Play, Puzzle, Unlock, Trophy } from 'lucide-react';
import Board from './components/Board';
import { Theme, Level, ScoreDetails } from './types';
import { shuffleGrid, canMove, checkWin, createSolvedGrid, calculateScore } from './services/gameLogic';

// --- CONFIGURATION ---

const LEVELS: Level[] = [
  { level: 1, gridSize: 2, name: "Uppvärmning", description: "Lär dig hur brickorna rör sig", parMoves: 6 },
  { level: 2, gridSize: 3, name: "Nybörjare", description: "Det klassiska 3x3 pusslet", parMoves: 20 },
  { level: 3, gridSize: 4, name: "Övad", description: "Nu börjar det bli klurigt", parMoves: 50 },
  { level: 4, gridSize: 5, name: "Expert", description: "Kräver tålamod och fokus", parMoves: 100 },
  { level: 5, gridSize: 6, name: "Mästare", description: "Endast för de uthålliga", parMoves: 200 },
  { level: 6, gridSize: 7, name: "Stormästare", description: "En rejäl mental utmaning", parMoves: 350 },
  { level: 7, gridSize: 8, name: "Legend", description: "Den ultimata prövningen", parMoves: 500 },
];

// Curated list of themes. Added 'gradient' for high-level playability.
const THEMES: Theme[] = [
  { id: 'numbers', name: 'Siffror', imageUrl: 'numbers' },
  { id: 'gradient', name: 'Färgspektrum', imageUrl: 'gradient' }, // New Gradient Theme
  { id: 'dog', name: 'Hund', imageUrl: '/images/1583511655857.jpg' },
  { id: 'cat', name: 'Katt', imageUrl: '/images/1573865526739.jpg' },
  { id: 'duck', name: 'Anka', imageUrl: '/images/1555852095.jpg' },
  { id: 'car', name: 'Röd Bil', imageUrl: '/images/1552519507.jpg' },
  { id: 'flower', name: 'Solros', imageUrl: '/images/1598838073192.jpg' },
  { id: 'strawberry', name: 'Jordgubbe', imageUrl: '/images/1543528176.jpg' },
  { id: 'balloons', name: 'Ballonger', imageUrl: '/images/1533461502717.jpg' },
  { id: 'lion', name: 'Lejon', imageUrl: '/images/1546182990.jpg' },
  { id: 'panda', name: 'Panda', imageUrl: '/images/1564349683136.jpg' },
  { id: 'plane', name: 'Flygplan', imageUrl: '/images/1474302770737.jpg' },
  { id: 'train', name: 'Tåg', imageUrl: '/images/1474487548417.jpg' },
  { id: 'fox', name: 'Räv', imageUrl: '/images/1474511320723.jpg' },
  { id: 'robot', name: 'Robot', imageUrl: '/images/1485827404703.jpg' },
  { id: 'pizza', name: 'Pizza', imageUrl: '/images/1565299624946.jpg' },
  { id: 'donut', name: 'Munk', imageUrl: '/images/1551024601.jpg' },
  { id: 'lego', name: 'Lego', imageUrl: '/images/1585366119957.jpg' },
  { id: 'butterfly', name: 'Fjäril', imageUrl: '/images/1559253609.jpg' },
];

// Sound utility function
const playMoveSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Create a pleasant "thock" sound
    osc.type = 'sine';
    // Pitch drop for that "solid" feel
    osc.frequency.setValueAtTime(300, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

    // Short envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime); // Volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    // Cleanup context after sound finishes
    setTimeout(() => {
      ctx.close();
    }, 150);
  } catch (e) {
    // Ignore audio errors
  }
};

export default function App() {
  // --- STATE ---
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Default to Level 1 (2x2)
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(0); // Track progress
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [highScores, setHighScores] = useState<{[key: number]: number}>({});
  const [lastScore, setLastScore] = useState<ScoreDetails | null>(null);

  // Game State
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Refs
  const timerRef = useRef<number | null>(null);
  const demoTimeoutRef = useRef<number | null>(null);
  
  const currentLevel = LEVELS[currentLevelIndex];

  // --- PERSISTENCE ---
  useEffect(() => {
    // Load Level Progress
    const savedLevel = localStorage.getItem('brickpussel_level');
    if (savedLevel) {
      const level = parseInt(savedLevel, 10);
      if (!isNaN(level) && level >= 0 && level < LEVELS.length) {
        setMaxUnlockedLevel(level);
      }
    }
    
    // Load High Scores
    const savedScores = localStorage.getItem('brickpussel_highscores');
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse high scores", e);
      }
    }
  }, []);

  // --- GAME LOGIC ---

  const startNewGame = useCallback((levelIndex: number = currentLevelIndex) => {
    // Clear demo stuff
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }

    const level = LEVELS[levelIndex];
    const { tiles: newTiles, emptyIndex: newEmpty } = shuffleGrid(level.gridSize);
    
    setTiles(newTiles);
    setEmptyIndex(newEmpty);
    setMoves(0);
    setIsSolved(false);
    setIsPlaying(true);
    setVictoryMessage(null);
    setShowLevelUp(false);
    setLastScore(null); // Reset score
    setStartTime(Date.now());
    setElapsedTime(0);
  }, [currentLevelIndex]);

  const handleMove = (index: number) => {
    // Prevent moves if demo mode, solved, or not playing
    if (isDemoMode || isSolved || !isPlaying) return;

    if (canMove(index, emptyIndex, currentLevel.gridSize)) {
      const newTiles = [...tiles];
      // Swap
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = currentLevel.gridSize * currentLevel.gridSize - 1;

      setTiles(newTiles);
      setEmptyIndex(index);
      setMoves(prev => prev + 1);
      
      // Play sound
      playMoveSound();

      // Check win
      if (checkWin(newTiles)) {
        handleWin(moves + 1);
      }
    }
  };

  const handleWin = async (finalMoves: number) => {
    setIsSolved(true);
    setIsPlaying(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    const finalTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    
    // --- SCORING ---
    const currentHigh = highScores[currentLevelIndex] || 0;
    const scoreResult = calculateScore(currentLevel, finalMoves, finalTime, currentHigh);
    setLastScore(scoreResult);

    // Save High Score
    if (scoreResult.isNewHigh) {
      const newScores = { ...highScores, [currentLevelIndex]: scoreResult.total };
      setHighScores(newScores);
      localStorage.setItem('brickpussel_highscores', JSON.stringify(newScores));
    }

    // --- PROGRESSION ---
    let levelUp = false;
    if (currentLevelIndex === maxUnlockedLevel && currentLevelIndex < LEVELS.length - 1) {
      const newMax = maxUnlockedLevel + 1;
      setMaxUnlockedLevel(newMax);
      localStorage.setItem('brickpussel_level', newMax.toString());
      levelUp = true;
      setShowLevelUp(true);
    }
    
    setVictoryMessage("Grattis! Du löste pusslet!");
  };

  // --- DEMO MODE LOOP ---
  useEffect(() => {
    if (!isDemoMode) return;

    // Initialize Demo Board (3x3 Numbers for clarity)
    const demoSize = 3;
    const solvedGrid = createSolvedGrid(demoSize);
    
    // Start solved
    setTiles([...solvedGrid]);
    setEmptyIndex(demoSize * demoSize - 1);
    
    // Use classic theme for demo
    setCurrentTheme(THEMES[0]); 

    let isMounted = true;

    const runDemoLoop = async () => {
      if (!isMounted) return;

      // 1. Wait a moment showing solved state (so user sees what it SHOULD look like)
      await new Promise(r => { demoTimeoutRef.current = setTimeout(r, 1000) });
      if (!isMounted) return;

      // 2. Scramble (and record moves to reverse them)
      const history: number[] = [];
      let currentEmpty = demoSize * demoSize - 1;
      let currentTiles = [...solvedGrid];

      // Perform moves to scramble
      const SCRAMBLE_MOVES = 12;
      for (let i = 0; i < SCRAMBLE_MOVES; i++) {
        const neighbors: number[] = [];
        const row = Math.floor(currentEmpty / demoSize);
        const col = currentEmpty % demoSize;

        if (row > 0) neighbors.push(currentEmpty - demoSize); // Up
        if (row < demoSize - 1) neighbors.push(currentEmpty + demoSize); // Down
        if (col > 0) neighbors.push(currentEmpty - 1); // Left
        if (col < demoSize - 1) neighbors.push(currentEmpty + 1); // Right

        // Pick random neighbor
        const randomPos = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Swap locally for calculation
        const temp = currentTiles[currentEmpty];
        currentTiles[currentEmpty] = currentTiles[randomPos];
        currentTiles[randomPos] = temp;
        
        // Update state to animate
        setTiles([...currentTiles]);
        setEmptyIndex(randomPos);
        
        history.push(currentEmpty); // Store where the empty slot came FROM (which is where we need to move the tile back TO)
        currentEmpty = randomPos;

        await new Promise(r => { demoTimeoutRef.current = setTimeout(r, 150) }); // Fast shuffle
        if (!isMounted) return;
      }

      // 3. Pause in scrambled state
      await new Promise(r => { demoTimeoutRef.current = setTimeout(r, 1000) });
      if (!isMounted) return;

      // 4. Solve (Replay history backwards)
      for (let i = history.length - 1; i >= 0; i--) {
        const targetPos = history[i]; // This is where the empty slot needs to go
        // In the puzzle, to move empty slot to targetPos, we move the tile AT targetPos to currentEmpty
        
        // Update state logic
        const temp = currentTiles[currentEmpty];
        currentTiles[currentEmpty] = currentTiles[targetPos];
        currentTiles[targetPos] = temp;

        setTiles([...currentTiles]);
        setEmptyIndex(targetPos);
        currentEmpty = targetPos;

        await new Promise(r => { demoTimeoutRef.current = setTimeout(r, 400) }); // Slower solve
        if (!isMounted) return;
      }

      // Loop
      runDemoLoop();
    };

    runDemoLoop();

    return () => {
      isMounted = false;
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
  }, [isDemoMode]);

  // --- TIMER ---
  useEffect(() => {
    if (isPlaying && !isSolved && !isDemoMode) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, isSolved, isDemoMode]);

  const exitDemo = () => {
    setIsDemoMode(false);
    setCurrentLevelIndex(maxUnlockedLevel < 0 ? 0 : maxUnlockedLevel); // Resume where left off, or 0
    startNewGame(maxUnlockedLevel < 0 ? 0 : maxUnlockedLevel);
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Styles for dynamic animations */}
      <style>{`
        @keyframes elasticPop {
          0% { transform: scale(0); opacity: 0; filter: blur(10px); }
          40% { transform: scale(1.6); opacity: 1; filter: blur(0px); }
          60% { transform: scale(0.85); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes bounceDown {
          0% { transform: translateY(-100px); opacity: 0; }
          60% { transform: translateY(20px); opacity: 1; }
          80% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes spinRay {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 flex flex-col gap-6">
        
        {/* Header - Different based on mode */}
        <div className="flex flex-col items-center text-center space-y-2">
          {isDemoMode ? (
            <div className="animate-fade-in space-y-2">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 drop-shadow-sm">
                Brickpussel
              </h1>
              <p className="text-slate-400 text-lg">Det klassiska sifferspelet</p>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-100">{currentLevel.name}</h2>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                    Nivå {currentLevel.level}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Move size={14} />
                    <span>{moves}</span>
                  </div>
                  {highScores[currentLevelIndex] > 0 && (
                    <div className="flex items-center gap-1 text-yellow-400/80" title="Bästa poäng">
                       <Trophy size={14} />
                       <span>{highScores[currentLevelIndex]}</span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => startNewGame()} 
                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-indigo-400 transition-colors"
                title="Starta om"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Board Area */}
        <div className="relative">
          <Board 
            tiles={tiles}
            size={isDemoMode ? 3 : currentLevel.gridSize}
            emptyIndex={emptyIndex}
            onMove={handleMove}
            imageUrl={currentTheme.imageUrl}
            isSolved={isSolved && !isDemoMode}
          />
          
          {/* Demo Mode Overlay Button */}
          {isDemoMode && (
            <div className="absolute -bottom-24 left-0 right-0 flex justify-center animate-bounce">
              <button
                onClick={exitDemo}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-10 py-5 rounded-full font-bold text-2xl shadow-xl hover:scale-105 transition-all hover:shadow-indigo-500/50"
              >
                <span>Nu kör vi!</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
        </div>

        {/* Controls - Only show when NOT in demo mode */}
        {!isDemoMode && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Level Selector (The Journey) */}
            <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Din Resa</label>
                <div className="text-xs text-indigo-400 font-mono">
                  {maxUnlockedLevel + 1} / {LEVELS.length} upplåsta
                </div>
              </div>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 rounded-full z-0"></div>
                
                <div className="flex justify-between relative z-10 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                   <div className="flex space-x-4 px-1">
                    {LEVELS.map((level, idx) => {
                      const isLocked = idx > maxUnlockedLevel;
                      const isActive = idx === currentLevelIndex;
                      const score = highScores[idx];
                      const hasScore = score !== undefined && score > 0;
                      
                      return (
                        <button
                          key={level.level}
                          disabled={isLocked}
                          onClick={() => {
                            setCurrentLevelIndex(idx);
                            startNewGame(idx);
                          }}
                          className={`
                            relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 flex-shrink-0
                            ${isActive 
                              ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/50' 
                              : isLocked 
                                ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' 
                                : 'bg-slate-700 border-indigo-500/50 text-indigo-200 hover:bg-slate-600 hover:scale-105'
                            }
                          `}
                        >
                          {isLocked ? (
                            <Lock size={14} />
                          ) : (
                            <span className="font-bold text-sm">{level.level}</span>
                          )}

                          {/* Completed Star Indicator */}
                          {hasScore && !isLocked && !isActive && (
                            <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5">
                               <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                          
                          {/* Label below */}
                          {isActive && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap text-indigo-300 flex flex-col items-center">
                              <span>{level.gridSize}x{level.gridSize}</span>
                              {hasScore && <span className="text-yellow-500 text-[9px]">{score}p</span>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                   </div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-white/5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Välj Tema</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-slate-800/50 p-1">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentTheme.id === theme.id ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20 z-10' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                    title={theme.name}
                  >
                    {theme.id === 'numbers' ? (
                      <div className="w-full h-full bg-[#f4e4bc] text-slate-900 flex items-center justify-center font-bold text-lg sm:text-xl">123</div>
                    ) : theme.id === 'gradient' ? (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                         <Puzzle className="text-white/80 w-6 h-6" />
                      </div>
                    ) : (
                      <img src={theme.imageUrl} alt={theme.name} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Victory Message Overlay */}
            {isSolved && victoryMessage && lastScore && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                  
                  {showLevelUp ? (
                     <div className="mb-8 relative py-4">
                       {/* Rotating Sunburst behind */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                         <div className="w-full h-full bg-indigo-500/20 rounded-full blur-md" style={{ animation: 'spinRay 10s linear infinite' }}>
                            {/* Simple rays via clip-path could go here, but keeping it simple with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-400/30 to-indigo-500/0 rotate-0"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-400/30 to-indigo-500/0 rotate-45"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-400/30 to-indigo-500/0 rotate-90"></div>
                         </div>
                       </div>

                       {/* Icon Animation: Elastic Pop */}
                       <div className="relative z-10 transform-gpu" style={{ animation: 'elasticPop 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
                         <div className="relative inline-block">
                            <Unlock className="w-24 h-24 text-indigo-300 mx-auto drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
                            <Star className="absolute -top-1 -right-1 w-10 h-10 text-yellow-300 animate-spin-slow fill-yellow-300 drop-shadow-lg" />
                         </div>
                       </div>

                       {/* Text Animation: Bounce Down with Shimmer */}
                       <div className="mt-6" style={{ animation: 'bounceDown 0.8s ease-out 0.4s forwards', opacity: 0 }}>
                          <div className="
                            text-3xl font-black uppercase italic tracking-widest 
                            bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 
                            bg-[length:200%_auto]
                            drop-shadow-lg
                          "
                          style={{ animation: 'shimmerText 3s linear infinite' }}>
                            Ny nivå upplåst!
                          </div>
                       </div>
                     </div>
                  ) : lastScore.isNewHigh ? (
                    <div className="mb-6">
                      <div className="relative inline-block animate-bounce">
                        <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-lg mx-auto" />
                        <Star className="absolute top-0 right-0 w-6 h-6 text-white fill-white animate-ping" />
                      </div>
                      <div className="mt-2 text-yellow-400 font-bold uppercase tracking-widest text-sm">Nytt Rekord!</div>
                    </div>
                  ) : (
                     <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                  )}
                  
                  <h3 className="text-3xl font-bold text-white mb-2">{showLevelUp ? "Nivå Klar!" : "Snyggt!"}</h3>
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-indigo-200 text-lg leading-relaxed italic">"{victoryMessage}"</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-indigo-900/20 rounded-xl p-4 mb-6 border border-indigo-500/20">
                    <div className="flex justify-between items-end mb-2 border-b border-indigo-500/20 pb-2">
                       <span className="text-slate-400 text-sm">Poäng</span>
                       <span className="text-3xl font-black text-white">{lastScore.total}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Baspoäng:</span>
                        <span>{lastScore.basePoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dragbonus:</span>
                        <span className="text-green-400">+{lastScore.moveBonus}</span>
                      </div>
                       <div className="flex justify-between">
                        <span>Tid:</span>
                        <span>{elapsedTime}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tidsbonus:</span>
                        <span className="text-green-400">+{lastScore.timeBonus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {showLevelUp && currentLevelIndex < LEVELS.length - 1 && (
                      <button
                        onClick={() => {
                          setCurrentLevelIndex(currentLevelIndex + 1);
                          startNewGame(currentLevelIndex + 1);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:scale-105"
                      >
                        <Play size={20} fill="currentColor" />
                        Spela Nästa Nivå
                      </button>
                    )}
                    
                    <button
                      onClick={() => startNewGame()}
                      className={`w-full ${showLevelUp ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2`}
                    >
                      <RotateCcw size={20} />
                      Spela Igen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}