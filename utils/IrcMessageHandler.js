import config from '../config.js';

export class IrcMessageHandler {
    async handleIRCMessage(msg) {
        const channelData = await bot.channels.get(msg.channelID);

        const user = {
        id: msg.senderUserID,
        login: msg.senderUsername,
        perms: bot.permissions.get(msg.senderUserID)
        };
        const channel = {
        id: msg.channelID,
        login: msg.channelName
        };
        const message = msg.messageText;
        const tags = msg.ircTags;

        // if (bot.ignoredUsers.has(user.id)) return;
        // if (bot.loggingUsers.has(user.id)) return;
        // if (bot.ignoredPhrases.has(message)) return;

        if (channel.id === config.bot.userId) return;

        //const channelState = bot.ircClient.client.userStateTracker.channelStates;

        if (user.perms >= bot.permissions.admin && !channelData.events) {
        if (!message.startsWith(channelData.prefix)) return;
        if (user.id === config.bot.userId) return;

        const [commandName, ...args] = message.slice(channelData.prefix.length).trim().split(/\s+/);
        const command = bot.commands[commandName.toLowerCase()];
        if (!command) return;

        const ircMsg = {
            raw: message,
            text: args.join(' '),
            prefix: channelData.prefix,
            args: args,
            command: {
            name: command.name,
            trigger: commandName.toLowerCase()
            },
            user: {
            id: user.id,
            login: user.login,
            perms: bot.permissions.get(user.id)
            },
            channel: {
            id: channel.id,
            login: channel.login
            },
            send: async (message, reply = true) => {
            return await bot.api.helix.sendMessage(channel.id, message, reply ? '' : '');
            }
        };

        }
    }
}
