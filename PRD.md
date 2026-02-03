# Brickpussel - Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** February 2026  
> **Status:** Active Development

---

## Executive Summary

**Brickpussel** is an AI-powered brick puzzle game that helps users solve brick puzzles with intelligent hints and guidance. Built with Google Gemini AI, it provides contextual assistance for brick puzzle challenges, making it accessible for both beginners and experienced puzzle enthusiasts.

### Target Users

- **Primary**: Puzzle enthusiasts looking for hints and guidance
- **Secondary**: Educational settings teaching problem-solving skills
- **Tertiary**: Casual gamers wanting to improve puzzle-solving abilities

### Unique Value Proposition

- **AI-Powered Hints**: Contextual assistance tailored to puzzle difficulty
- **Adaptive Guidance**: Hints adjust based on user's progress
- **Modern Interface**: Clean, responsive design for all devices
- **TypeScript**: Full type safety for reliable code

---

## 1. Product Vision

Brickpussel aims to make brick puzzle-solving accessible to everyone by providing intelligent, contextual hints that guide users without spoiling the solution, fostering learning and skill development.

### Success Metrics

- **User Engagement**: Daily active users and session duration
- **Hint Effectiveness**: Percentage of users completing puzzles after hints
- **User Satisfaction**: Rating of hint quality and usefulness
- **Puzzle Variety**: Number of different puzzle types supported

---

## 2. Core Features

### 2.1 AI-Powered Hints

**Priority:** P0 (Critical)

**Description:** Users can request intelligent hints for brick puzzles they're stuck on.

**Requirements:**
- Context-aware hint generation
- Progressive hint levels (subtle → explicit)
- Hint history tracking
- Skip hint option

**User Stories:**
- As a puzzle solver, I want intelligent hints so I can get unstuck
- As a beginner, I want progressive hints so I can learn gradually
- As a user, I want hint history so I can review what helped

**Technical Notes:**
- Google Gemini AI integration
- Hint level system (1-5)
- Hint generation based on puzzle context
- Hint effectiveness tracking

---

### 2.2 Puzzle Interface

**Priority:** P0 (Critical)

**Description:** Modern, clean interface for brick puzzle display and interaction.

**Requirements:**
- Responsive design for all devices
- Clean, minimalist UI
- Puzzle display area
- Hint display panel
- Progress tracking

**User Stories:**
- As a user, I want a clean interface so I can focus on puzzles
- As a mobile user, I want responsive design so I can play anywhere
- As a user, I want progress tracking so I can see my improvement

**Technical Notes:**
- React 18 for UI
- Tailwind CSS for styling
- shadcn/ui components
- Responsive breakpoints

---

### 2.3 Puzzle Library

**Priority:** P1 (High)

**Description:** Collection of brick puzzles with varying difficulty levels.

**Requirements:**
- Multiple puzzle types (logic, math, word, visual)
- Difficulty categorization
- Puzzle filtering
- Progress tracking per puzzle type

**User Stories:**
- As a user, I want different puzzle types so I can practice various skills
- As a user, I want difficulty levels so I can challenge myself appropriately
- As a user, I want filtering so I can find puzzles I like

**Technical Notes:**
- Puzzle data structure
- Difficulty algorithm
- Type classification system

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI framework |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast development server |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built UI components |
| **AI** | Google Gemini AI | AI model for hints |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Brickpussel Frontend                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  React Application (TypeScript + Vite)                   ││
│  │  - Puzzle Interface                                    ││
│  │  - Hint System                                        ││
│  │  - Progress Tracking                                   ││
│  │  - Puzzle Library                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Gemini AI Service                                     ││
│  │  - Hint Generation                                      ││
│  │  - Context Analysis                                    ││
│  │  - Difficulty Assessment                               ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  LocalStorage (Progress & Settings)                     ││
│  │  - Puzzle Progress                                     ││
│  │  - Hint History                                        ││
│  │  - User Preferences                                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow

**Hint Request Flow:**
1. User requests hint for puzzle
2. Current puzzle state and progress analyzed
3. Appropriate hint level determined
4. Hint generated by Gemini AI
5. Hint displayed to user
6. Hint effectiveness tracked

**Puzzle Progress Flow:**
1. User attempts puzzle solution
2. Solution validated
3. Progress updated
4. Difficulty adjusted if needed
5. Next puzzle suggested

---

## 4. User Experience

### 4.1 Onboarding

**First-Time User Experience:**

1. **Welcome Screen**
   - Introduction to Brickpussel
   - Quick start guide
   - First puzzle suggestion

2. **Tutorial**
   - How to request hints
   - Hint level explanation
   - Progress tracking overview

### 4.2 Daily Use

**Typical Session:**
1. User opens Brickpussel
2. Selects puzzle from library
3. Attempts solution
4. Requests hint if stuck
5. Receives contextual hint
6. Continues solving
7. Completes puzzle
8. Progress tracked

### 4.3 Error States

**Graceful Degradation:**
- API failure: "Kan inte generera hint just nu. Försök igen."
- No hints available: "Inga fler hints tillgängliga för denna pussel."
- Puzzle loading failure: "Kunde inte ladda pussel. Försök igen."

---

## 5. Roadmap

### Phase 1: MVP (Current)

- ✅ AI-powered hints
- ✅ Puzzle interface
- ✅ Progress tracking
- ✅ Hint system

### Phase 2: Enhanced Experience (Q1 2026)

- 🔄 Puzzle library expansion
- 🔄 Difficulty algorithm
- 🔄 User profiles
- 🔄 Hint customization

### Phase 3: Advanced Features (Q2 2026)

- 📝 Multiplayer mode
- 🔍 Puzzle creator
- 🏆 Leaderboards
- 🤖 Community hints

---

## 6. Success Criteria

### Technical

- [ ] Hint generation time < 2 seconds
- [ ] API response time < 3 seconds
- [ ] Mobile responsive on all devices
- [ ] Hint effectiveness > 80%

### User Experience

- [ ] Hint request success rate > 95%
- [ ] User satisfaction > 4.5/5
- [ ] Session retention > 70%
- [ ] Puzzle completion rate > 60%

### Business

- [ ] 50+ daily active users
- [ ] 30% of users request hints
- [ ] 5+ puzzles completed per session
- [ ] 90% uptime for Gemini API

---

## 7. Risks & Mitigations

### Risk 1: Gemini API Limits

**Risk:** API rate limits or quota exhaustion

**Mitigation:**
- Implement request throttling
- Cache common hints
- Graceful degradation

### Risk 2: Hint Quality

**Risk:** AI providing unhelpful or too obvious hints

**Mitigation:**
- Progressive hint levels
- User feedback mechanism
- Hint quality tracking

### Risk 3: Puzzle Variety

**Risk:** Limited puzzle types causing user boredom

**Mitigation:**
- Regular puzzle additions
- Community puzzle creation
- Difficulty algorithm tuning

---

## 8. Dependencies

### External Services

- **Google Gemini AI**: AI model for hint generation (API key required)
- **Google AI Studio**: API key management

### Libraries

- `react`, `react-dom`: UI framework
- `@google/genai`: Gemini AI SDK
- `vite`: Build tooling
- `tailwindcss`: Styling
- `shadcn/ui`: Components

---

## 9. Appendix

### A. Environment Variables

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### B. Installation Instructions

```bash
# Clone the repository
git clone https://github.com/magnusfroste/brickpussel.git
cd brickpussel

# Install dependencies
npm install

# Set your Gemini API key in .env.local
GEMINI_API_KEY=your_gemini_api_key

# Run development server
npm run dev

# Build for production
npm run build
```

### C. Getting an API Key

1. Go to [Google AI Studio](https://ai.google.dev)
2. Create a new API key
3. Add to `.env.local` file
4. Restart development server

---

**Document History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 2026 | Initial PRD creation | Magnus Froste |

---

**License:** MIT - See LICENSE file for details
