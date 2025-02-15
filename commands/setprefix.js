export default {
  name: 'setprefix',
  description: 'set the prefix in a channel',
  aliases: [],
  access: bot.permissions.mod,
  cooldown: bot.cooldown.veryShort,
  async execute(msg, response) {
    if (!msg.args.length) {
      return response(`usage: ${msg.prefix}${msg.command.trigger} ${this.usage}`, { error: true });
    }

    const prefix = msg.args[0];

    if (prefix.length > 15) {
      return response('FeelsDankMan This prefix is too long, the maximum length is 15 characters', {
        error: true
      });
    }

    if (msg.prefix === prefix) {
      return response(`FeelsDankMan The prefix is already "${msg.prefix}"`, { error: true });
    }

    const reservedSymbols = ['.', '/'];
    if (reservedSymbols.some((reservedSymbol) => prefix.startsWith(reservedSymbol))) {
      return response(
        `FeelsDankMan didn't update prefix because it starts with a twitch reserved symbol`,
        { error: true }
      );
    }

    await bot.channels.update(msg.channel.id, `prefix`, prefix);

    return response(`SeemsGood The new prefix is "${prefix}"`);
  }
};
