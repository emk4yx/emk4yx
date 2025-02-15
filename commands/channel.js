import config from '../config.js';

export default {
  name: 'channel',
  description: 'join or part a channel',
  access: bot.permissions.admin,
  usage: '<join|part> <channel>',
  async execute(msg, response) {
    if (msg.args.length < 2) {
      return response(`usage: ${msg.prefix}${msg.command.trigger} ${this.usage}`, { error: true });
    }

    const action = msg.args[0].toLowerCase();
    const channel = bot.utils.sanitizeUser(msg.args[1]);

    const channelId = await bot.api.ivr.getUserId(channel);
    if (!channelId) {
      return response(`FeelsDankMan channel ${channel} not found`);
    }

    switch (action) {
      case 'join': {
        if (bot.channels.has(channelId)) {
          return response(`already joined channel ${bot.utils.antiPing(channel)}`);
        }

        const moderatedChannels = await bot.api.helix.getModeratingChannels();
        if (!moderatedChannels.has(channelId)) {
          return response(
            `i'm not modded in ${bot.utils.antiPing(channel)}. please add @${config.bot.username} as a moderator in this channel and retry`
          );
        }

        await bot.channels.join(channelId, channel);

        return response(`joined channel ${bot.utils.antiPing(channel)}`);
      }

      case 'part': {
        if (!bot.channels.has(channelId)) {
          return response(`channel ${bot.utils.antiPing(channel)} is not joined`);
        }

        await bot.channels.part(channelId);

        return response(`parted channel ${bot.utils.antiPing(channel)}`);
      }

      default: {
        return response(`usage: ${this.usage}`, { error: true });
      }
    }
  }
};
