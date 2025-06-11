class SlotMachine {
  constructor() {
    this.symbols = ['◇', '◆', '♠', '♣', '♥', '♦', '★', '☆', '◈', '◎'];
    this.spinning = false;
    this.display = '';
    this.spinDuration = 0;
    this.spinStartTime = 0;
    this.selectedTask = null;
  }

  start(tasks) {
    if (tasks.length === 0) return null;
    
    this.spinning = true;
    this.spinDuration = 2000 + Math.random() * 1000; // 2-3 seconds
    this.spinStartTime = Date.now();
    this.selectedTask = null;
    
    return this.spinDuration;
  }

  update() {
    if (!this.spinning) return;

    const elapsed = Date.now() - this.spinStartTime;
    const progress = elapsed / this.spinDuration;

    if (progress >= 1) {
      this.spinning = false;
      this.display = '🎯 SELECTED! 🎯';
      return;
    }

    // Create spinning effect with decreasing speed
    const speed = Math.max(50, 200 * (1 - progress));
    const currentSymbol = this.symbols[Math.floor(Date.now() / speed) % this.symbols.length];
    
    // Build spinning display
    const spinLine = Array(15).fill().map((_, i) => {
      const offset = (Date.now() / (speed + i * 10)) % this.symbols.length;
      return this.symbols[Math.floor(offset)];
    }).join(' ');

    this.display = `${spinLine}\n    ${currentSymbol}    \n${spinLine}`;
  }

  isSpinning() {
    return this.spinning;
  }

  getDisplay() {
    return this.display;
  }

  selectTask(tasks) {
    if (tasks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * tasks.length);
    this.selectedTask = {
      task: tasks[randomIndex],
      index: randomIndex
    };
    
    return this.selectedTask;
  }

  reset() {
    this.spinning = false;
    this.display = '';
    this.selectedTask = null;
  }
}

export default SlotMachine;