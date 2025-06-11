import chalk from 'chalk';

class Renderer {
  constructor() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
    this.lastRenderedState = null;
  }

  clear() {
    process.stdout.write('\x1b[2J');
  }

  moveCursor(x, y) {
    process.stdout.write(`\x1b[${y};${x}H`);
  }

  hideCursor() {
    process.stdout.write('\x1b[?25l');
  }

  showCursor() {
    process.stdout.write('\x1b[?25h');
  }

  write(text, x = 1, y = 1) {
    this.moveCursor(x, y);
    process.stdout.write(text);
  }

  drawBox(x, y, width, height, title = '') {
    const topBorder = '┌' + '─'.repeat(width - 2) + '┐';
    const bottomBorder = '└' + '─'.repeat(width - 2) + '┘';
    const sideBorder = '│' + ' '.repeat(width - 2) + '│';

    this.write(topBorder, x, y);
    for (let i = 1; i < height - 1; i++) {
      this.write(sideBorder, x, y + i);
    }
    this.write(bottomBorder, x, y + height - 1);

    if (title) {
      this.write(chalk.bold(` ${title} `), x + 2, y);
    }
  }

  centerText(text, y) {
    const x = Math.floor((this.width - text.length) / 2);
    this.write(text, x, y);
  }

  needsUpdate(state) {
    if (!this.lastRenderedState) return true;

    // Check if any meaningful state has changed
    const current = JSON.stringify({
      tasks: state.tasks,
      selectedTask: state.selectedTask,
      slotMachine: state.slotMachine,
      pomodoro: {
        active: state.pomodoro.active,
        mode: state.pomodoro.mode,
        timeLeft: Math.floor(state.pomodoro.timeLeft / 1000), // Round to seconds to avoid constant updates
      },
    });

    return current !== this.lastRenderedState;
  }

  render(state) {
    if (!this.needsUpdate(state)) return;

    this.clear();
    this.hideCursor();

    const header = chalk.bold.cyan('TASK BANDIT');
    this.centerText(header, 1);

    const currentTime = new Date().toLocaleTimeString();
    this.write(chalk.gray(currentTime), this.width - 10, 1);

    this.drawBox(2, 3, this.width - 3, 8, 'Tasks');

    if (state.tasks.length === 0) {
      this.write(chalk.gray('No tasks yet. Press "a" to add one!'), 4, 6);
    } else {
      state.tasks.forEach((task, index) => {
        const isSelected = index === state.selectedTask;
        const timeLeft = this.getTimeLeft(task.createdAt);
        const taskLine = `${isSelected ? '>' : ' '} ${task.text} ${chalk.gray(`(${timeLeft})`)}`;

        let color = chalk.white;
        if (timeLeft.includes('expired')) color = chalk.red;
        else if (timeLeft.includes('hour')) color = chalk.yellow;

        this.write(color(taskLine), 4, 5 + index);
      });
    }

    if (state.slotMachine.spinning) {
      this.drawBox(2, 12, this.width - 3, 5, 'Slot Machine');
      this.centerText(state.slotMachine.display, 14);
    }

    if (state.pomodoro.active) {
      this.drawBox(2, 18, this.width - 3, 4, 'Pomodoro Timer');
      const timerText = `${state.pomodoro.mode}: ${this.formatTime(state.pomodoro.timeLeft)}`;
      this.centerText(timerText, 19);
    }

    const controls = ['a: Add task', 'd: Delete task', 'r: Random pick', 'space: Timer', 'j/k: Navigate', 'q: Quit'];
    this.write(chalk.gray(controls.join(' | ')), 2, this.height - 1);

    // Store current state
    this.lastRenderedState = JSON.stringify({
      tasks: state.tasks,
      selectedTask: state.selectedTask,
      slotMachine: state.slotMachine,
      pomodoro: {
        active: state.pomodoro.active,
        mode: state.pomodoro.mode,
        timeLeft: Math.floor(state.pomodoro.timeLeft / 1000),
      },
    });
  }

  getTimeLeft(createdAt) {
    const now = Date.now();
    const elapsed = now - createdAt;
    const remaining = 24 * 60 * 60 * 1000 - elapsed;

    if (remaining <= 0) return 'expired';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default Renderer;
