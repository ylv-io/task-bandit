class PomodoroTimer {
  constructor() {
    this.workDuration = 25 * 60 * 1000; // 25 minutes
    this.breakDuration = 5 * 60 * 1000; // 5 minutes
    this.active = false;
    this.mode = 'work'; // 'work' or 'break'
    this.timeLeft = this.workDuration;
    this.startTime = 0;
    this.pausedTime = 0;
  }

  start() {
    if (!this.active) {
      this.active = true;
      this.startTime = Date.now() - this.pausedTime;
    }
  }

  pause() {
    if (this.active) {
      this.active = false;
      this.pausedTime = Date.now() - this.startTime;
    }
  }

  toggle() {
    if (this.active) {
      this.pause();
    } else {
      this.start();
    }
  }

  update() {
    if (!this.active) return false;

    const elapsed = Date.now() - this.startTime;
    const duration = this.mode === 'work' ? this.workDuration : this.breakDuration;
    this.timeLeft = Math.max(0, duration - elapsed);

    if (this.timeLeft === 0) {
      this.complete();
      return true; // Timer completed
    }

    return false;
  }

  complete() {
    // Switch between work and break modes
    this.mode = this.mode === 'work' ? 'break' : 'work';
    this.timeLeft = this.mode === 'work' ? this.workDuration : this.breakDuration;
    this.active = false;
    this.pausedTime = 0;
    this.startTime = 0;
  }

  reset() {
    this.active = false;
    this.mode = 'work';
    this.timeLeft = this.workDuration;
    this.pausedTime = 0;
    this.startTime = 0;
  }

  getStatus() {
    return {
      active: this.active,
      mode: this.mode,
      timeLeft: this.timeLeft,
      isComplete: this.timeLeft === 0
    };
  }

  formatTime() {
    const totalSeconds = Math.floor(this.timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default PomodoroTimer;