export class Utils {
  now() {
    return Math.floor(Date.now() / 1000);
  }

  timeSince(timestamp) {
    let delta;

    if (timestamp instanceof Date) {
      delta = timestamp.getTime();
    } else if (typeof timestamp === 'string' && !isNaN(Date.parse(timestamp))) {
      delta = new Date(timestamp).getTime();
    } else {
      delta = Number(timestamp);
      if (String(timestamp).length <= 10) delta *= 1000;
    }

    const duration = Date.now() - delta;

    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    const parts = [
      days > 0 ? `${days}d` : null,  //${this.pluralize('day', days)}
      hours > 0 ? `${hours}h}` : null,
      minutes > 0 ? `${minutes}m` : null,
      seconds > 0 ? `${seconds}s` : null
    ];

    return this.joinMessage(parts, ' ');
  }

  sanitizeUser(username = '', fallback = '') {
    if (!username) return fallback;

    return username
      .toLowerCase()
      .replace(/[^a-z0-9_]/gi, '')
      .replace(/^_+/, '');
  }

  antiPing(text = '') {
    const [start = '', ...rest] = text;
    const end = rest.pop() || '';

    return `${start}\u{E0000}${rest.join('')}${rest.length ? '\u{E0000}' : ''}${end}`;
  }

  formatNumber(number = 0) {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || 0;
  }

  pluralize(word, length, appendix = 's') {
    return length === 1 ? word : word + appendix;
  }

  joinMessage(messages, separator = ` | `) {
    return messages.filter(Boolean).join(separator);
  }

  async sleep(ms = 200) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
