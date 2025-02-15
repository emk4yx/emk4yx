export class Logger {
  // https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
  #logMessage(type, color, ...args) {
    const formattedDate = new Date().toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const coloredDate = `\x1b[37m${formattedDate}\x1b[97m`;
    const coloredType = `\x1b[${color}m${type}\x1b[97m`;

    console.log(`${coloredDate} [${coloredType}]`, ...args);
  }

  msg(...args) {
    this.#logMessage('LOG', '34', ...args);
  };

  info(...args) {
    this.#logMessage('INF', '32', ...args);
  };

  warn(...args) {
    this.#logMessage('WRN', '33', ...args);
  };

  error(...args) {
    this.#logMessage('ERR', '31', ...args);
  };

  twitch(...args) {
    this.#logMessage('TTV', '95', ...args)
  }
}