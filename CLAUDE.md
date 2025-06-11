# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` - Run the Task Bandit CLI application
- `npm run dev` - Run with Node.js watch mode for development

## Architecture

Task Bandit is an interactive CLI task manager built with ES modules and custom terminal rendering.

### Core Components

**TaskBandit (src/index.js)** - Main application class that orchestrates all components:
- Maintains centralized application state
- Handles vim-like keyboard input (j/k navigation, a/d/r/space/q actions)
- Runs main update loop at 100ms intervals
- Manages raw terminal mode and graceful shutdown

**Renderer (src/renderer.js)** - Custom terminal renderer using ANSI escape codes:
- No external UI libraries - uses raw stdout and ANSI codes
- Draws ASCII boxes and positioned text
- Handles cursor positioning and terminal clearing
- Renders tasks with color-coded time remaining (red=expired, yellow=urgent)

**TaskManager (src/taskManager.js)** - Task persistence and lifecycle:
- Auto-expires tasks after 24 hours
- Persists to tasks.json via Storage class
- Handles CRUD operations and random task selection

**SlotMachine (src/slotMachine.js)** - Animated task selection:
- 2-3 second spinning animation with decreasing speed
- Uses Unicode symbols (◇, ◆, ♠, ♣, ♥, ♦, ★, ☆, ◈, ◎)
- Realistic slot machine effect with gradual slowdown

**PomodoroTimer (src/pomodoroTimer.js)** - 25/5 minute work/break intervals:
- Toggleable timer with pause/resume
- Auto-switches between work and break modes
- Tracks elapsed time and remaining duration

### Data Flow

1. TaskBandit orchestrates all components and maintains shared state
2. User input triggers state changes via keyboard handlers
3. Update loop (100ms) refreshes component states and triggers re-renders
4. Renderer displays current state using ANSI terminal controls
5. TaskManager persists changes to tasks.json automatically

### Input Handling

The app uses raw terminal mode with vim-like keybindings:
- Single character input without Enter key
- Raw mode setup/teardown for proper terminal restoration
- Graceful Ctrl+C handling with cleanup