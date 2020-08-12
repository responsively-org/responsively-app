const db = require('electron-settings');

const OPEN_COUNT = 'openCount';

class AppMetadata {
  incrementOpenCount() {
    const count = db.get(OPEN_COUNT) || 0;
    db.set(OPEN_COUNT, count + 1);
  }

  getOpenCount() {
    return db.get(OPEN_COUNT) || 0;
  }
}

export default new AppMetadata();
