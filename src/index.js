#!/usr/bin/env node

import Renderer from './renderer.js';
import TaskManager from './taskManager.js';
import SlotMachine from './slotMachine.js';
import PomodoroTimer from './pomodoroTimer.js';
import { createInterface } from 'readline';

class TaskBandit {
  constructor() {
    this.renderer = new Renderer();
    this.taskManager = new TaskManager();
    this.slotMachine = new SlotMachine();
    this.pomodoro = new PomodoroTimer();

    this.state = {
      tasks: [],
      selectedTask: 0,
      slotMachine: {
        spinning: false,
        display: '',
      },
      pomodoro: {
        active: false,
        mode: 'work',
        timeLeft: 25 * 60 * 1000,
      },
    };

    this.running = false;
    this.updateInterval = null;
    this.setupInput();
  }

  setupInput() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      this.handleInput(key);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      this.quit();
    });
  }

  handleInput(key) {
    const keyCode = key.charCodeAt(0);

    // Handle Ctrl+C
    if (keyCode === 3) {
      this.quit();
      return;
    }

    switch (key.toLowerCase()) {
      case 'q':
        this.quit();
        break;
      case 'a':
        this.addTask();
        break;
      case 'd':
        this.deleteTask();
        break;
      case 'r':
        this.randomPick();
        break;
      case ' ':
        this.togglePomodoro();
        break;
      case 'j':
        this.navigateDown();
        break;
      case 'k':
        this.navigateUp();
        break;
    }
  }

  async addTask() {
    this.renderer.showCursor();
    this.renderer.write('Enter task: ', 2, this.renderer.height - 2);

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      const answer = await new Promise((resolve) => {
        rl.question('', resolve);
      });

      if (answer.trim()) {
        this.taskManager.addTask(answer.trim());
        this.updateState();
      }
    } catch (error) {
      // Handle any input errors
    } finally {
      rl.close();
      this.renderer.hideCursor();
      this.setupInput(); // Re-setup raw mode
    }
  }

  deleteTask() {
    if (this.state.tasks.length > 0) {
      this.taskManager.deleteTask(this.state.selectedTask);
      this.state.selectedTask = Math.max(0, Math.min(this.state.selectedTask, this.taskManager.getTasks().length - 1));
      this.updateState();
    }
  }

  randomPick() {
    if (this.state.tasks.length === 0) return;

    this.slotMachine.start(this.state.tasks);
    this.state.slotMachine.spinning = true;

    setTimeout(() => {
      const selected = this.slotMachine.selectTask(this.state.tasks);
      if (selected) {
        this.state.selectedTask = selected.index;
      }
      this.slotMachine.reset();
      this.state.slotMachine.spinning = false;
      this.updateState();
    }, 3000);
  }

  togglePomodoro() {
    this.pomodoro.toggle();
    this.updateState();
  }

  navigateUp() {
    if (this.state.tasks.length > 0) {
      this.state.selectedTask = Math.max(0, this.state.selectedTask - 1);
      this.updateState();
    }
  }

  navigateDown() {
    if (this.state.tasks.length > 0) {
      this.state.selectedTask = Math.min(this.state.tasks.length - 1, this.state.selectedTask + 1);
      this.updateState();
    }
  }

  updateState() {
    this.state.tasks = this.taskManager.getTasks();
    this.state.slotMachine = {
      spinning: this.slotMachine.isSpinning(),
      display: this.slotMachine.getDisplay(),
    };

    const pomodoroStatus = this.pomodoro.getStatus();
    this.state.pomodoro = pomodoroStatus;
  }

  update() {
    if (this.slotMachine.isSpinning()) {
      this.slotMachine.update();
    }

    const pomodoroCompleted = this.pomodoro.update();
    if (pomodoroCompleted) {
      // Could add notification here
    }

    this.updateState();
    this.renderer.render(this.state);
  }

  start() {
    this.running = true;
    this.updateState();

    // Initial render
    this.renderer.render(this.state);

    // Start update loop
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
  }

  quit() {
    this.running = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.renderer.clear();
    this.renderer.showCursor();
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.exit(0);
  }
}

// Start the application
const app = new TaskBandit();
app.start();
