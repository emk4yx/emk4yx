export class Stats {
  constructor() {
    this.commandsExecuted = 0;
    this.runningSince = Math.floor(Date.now() / 1000);
  }

  async commandExecuted(command = '') {
    if (!command) return;

    this.commandsExecuted++;
    await bot.db.query(
      'INSERT INTO commandStats (command, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
      [command]
    );
  }
}
