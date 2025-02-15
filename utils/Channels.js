import config from '../config.js';

export class Channels {
  constructor() {
    this.channelsMap = new Map();
  }

  async initialize() {
    const channels = await bot.db.query(`SELECT * FROM channels`);
    for (const channel of channels) {
      this.set(channel.userId, channel);
    }
  }

  get(userId) {
    return this.channelsMap.get(userId) || null;
  }

  getAll() {
    return  [...this.channelsMap.keys()];
  }

  set(userId, data) {
    this.channelsMap.set(userId, data);
  }

  has(userId) {
    return this.channelsMap.has(userId);
  }

  async update(userId, setting, value) {
    const channel = this.get(userId);

    channel[setting] = value;
    await bot.db.query(`UPDATE channels SET ${setting} = ? WHERE userId = ?`, [value, userId]);
  }

  async join(userId, login, prefix = config.bot.prefix) {

    await Promise.all([
      bot.conduitClient.subscribeToEvents([userId]),
      bot.db.query(`INSERT INTO channels (userId, login, prefix) VALUES (?, ?, ?)`, [
        userId,
        login,
        prefix
      ])
    ]);

    this.set(userId, {
      userId,
      login,
      prefix,
      mode: 1
    });
  }

  async part(userId) {
    await Promise.all([
      bot.conduitClient.unsubscribeFromEvents([userId]),
      bot.db.query(`DELETE FROM channels WHERE userId = ?`, [userId]),
      this.channelsMap.delete(userId)
    ]);
  }
}