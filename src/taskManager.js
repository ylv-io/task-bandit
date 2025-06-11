import Storage from './storage.js';

class TaskManager {
  constructor() {
    this.storage = new Storage();
    this.data = this.storage.load();
    this.cleanExpiredTasks();
  }

  addTask(text) {
    const newTask = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: Date.now(),
      completed: false,
    };

    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  deleteTask(index) {
    if (index >= 0 && index < this.data.tasks.length) {
      const deleted = this.data.tasks.splice(index, 1);
      this.save();
      return deleted[0];
    }
    return null;
  }

  getTasks() {
    this.cleanExpiredTasks();
    return this.data.tasks;
  }

  getTask(index) {
    if (index >= 0 && index < this.data.tasks.length) {
      return this.data.tasks[index];
    }
    return null;
  }

  cleanExpiredTasks() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    const initialCount = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((task) => {
      return now - task.createdAt < dayInMs;
    });

    if (this.data.tasks.length !== initialCount) {
      this.save();
    }
  }

  getRandomTask() {
    const activeTasks = this.getTasks();
    if (activeTasks.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * activeTasks.length);
    return {
      task: activeTasks[randomIndex],
      index: randomIndex,
    };
  }

  save() {
    this.storage.save(this.data);
  }
}

export default TaskManager;
