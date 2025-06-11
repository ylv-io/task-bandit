import fs from 'fs';
import path from 'path';

class Storage {
  constructor() {
    this.dataFile = path.join(process.cwd(), 'tasks.json');
  }

  load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error.message);
    }
    return { tasks: [] };
  }

  save(data) {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving tasks:', error.message);
    }
  }
}

export default Storage;
