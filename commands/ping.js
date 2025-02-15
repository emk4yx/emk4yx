export default {
  name: 'ping',
  description: 'pong',
  aliases: ['pong'],
  access: bot.permissions.default,
  cooldown: bot.cooldown.veryShort,
  async execute(msg, response) {
    const messages = [
      `🏓 ${msg.command.trigger === 'pong' ? 'PING' : 'PONG'}`,
      `bot uptime: ${bot.utils.timeSince(bot.stats.runningSince)}`,
      `channels: ${bot.channels.getAll().length}`,
      `commands executed: ${bot.utils.formatNumber(bot.stats.commandsExecuted+1)}`
    ];

    return msg.sendAction(bot.utils.joinMessage(messages));
  }
};
