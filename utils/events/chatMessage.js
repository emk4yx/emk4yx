import config from '../../config.js';

export const channelChatMessage = async (event) => {
  const channel = bot.channels.get(event.broadcaster_user_id);

  const prefix = channel.prefix || config.bot.prefix;

  bot.db.query(
    `INSERT INTO users (userId, username) VALUES (?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username)`,
    [event.chatter_user_id, event.chatter_user_login]
  );

  if (!event.message.text.startsWith(prefix)) return;
  if (event.chatter_user_id === config.bot.userId) return;

  const filteredText = event.message.text.replace(/\s+/g, ' ').trim();
  const args = filteredText.slice(prefix.length).trim().split(' ');
  const commandName = args.shift().toLowerCase();

  const command = bot.commands[commandName];
  if (!command) return;

  const msg = {
    id: event.message_id,
    text: args.join(' '),
    prefix: prefix,
    args: args,
    command: {
      name: command.name,
      trigger: commandName
    },
    channel: {
      id: event.broadcaster_user_id,
      login: event.broadcaster_user_login,
      name: event.broadcaster_user_name
    },
    user: {
      id: event.chatter_user_id,
      login: event.chatter_user_login,
      name: event.chatter_user_name,
      perms: bot.permissions.get(event.chatter_user_id, event.badges)
    },

    async send(message, reply = true) {
      const parent = reply ? event.message_id : '';
      await bot.api.helix.sendMessage(event.broadcaster_user_id, message, parent);
    },

    async sendAction(message) {
      await bot.api.helix.sendAction(event.broadcaster_user_id, message);
    }
  };

  const cooldownKey = `${bot.db.ns}:commands:${command.name}-${msg.user.id}`;
  const hasCooldown = bot.cooldown.has(cooldownKey);
  if (hasCooldown && msg.user.perms < bot.permissions.admin) return;

  if (msg.user.perms < bot.permissions.default) {
    const cooldownKey = `${bot.db.ns}:ignoredUser:${msg.user.id}`;
    if (await bot.cooldown.has(cooldownKey)) {
      return;
    }

    return msg.send(`you're being ignored`, true);
  }

  const access = command.access ?? bot.permissions.default;
  if (access > msg.user.perms) {
    return msg.send(`you don't have the required permission to execute this command`, true);
  }

  const commandCooldown = command.cooldown ?? bot.cooldown.short;
  if (commandCooldown) {
    bot.cooldown.set(cooldownKey, commandCooldown);
  }

  try {
    const responseFunction = (text, { reply = true, error = false } = {}) => ({
      text,
      reply,
      error
    });
    const response = await command.execute(msg, responseFunction);

    if (response?.error) {
      bot.cooldown.remove(cooldownKey);
    }

    if (response?.text) {
      const parent = response?.reply ? event.message_id : '';
      await bot.api.helix.sendMessage(event.broadcaster_user_id, response.text, parent);
    }

    await bot.stats.commandExecuted(msg.command.trigger);
  } catch (e) {
    const parent = event.message_id;
    await bot.api.helix.sendMessage(event.broadcaster_user_id, `FeelsDankMan ${e}`, parent);
  }
};
