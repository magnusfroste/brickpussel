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
  { level: 4, gridSize: 5, name: "Experten", description: "Kräver tålamod och fokus", parMoves: