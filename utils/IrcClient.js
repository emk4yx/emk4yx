import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, ConnectionRateLimiter, JoinRateLimiter } from '@kararty/dank-twitch-irc';
import config from '../config.js';
import { IrcMessageHandler } from './IrcMessageHandler.js';

export class IrcClient {
  /** @type { ChatClient } */
  client = null;
  messageHandler = new IrcMessageHandler();

  async initialize() {
    const token = await bot.api.helix.getBotAuthToken();
    this.client = new ChatClient({
      username: config.bot.username,
      password: `oauth:${token}`,
      rateLimits: 'verifiedBot',
      ignoreUnhandledPromiseRejections: true,
    });

    this.client.use(new AlternateMessageModifier(this.client));
    this.client.use(new JoinRateLimiter(this.client));
    this.client.use(new ConnectionRateLimiter(this.client));
    this.client.use(new SlowModeRateLimiter(this.client, 10));

    this.client.connect();
    this.client.on('ready', async () => {
      await this.joinChannels();
      //bot.logger.irc('Client ready');
      console.log('Client ready');
      //setInterval(() => this.joinChannels(), 30 * bot.constants.milliseconds.minute);
    });

    this.client.on('PRIVMSG', async (msg) => {
      await this.messageHandler.handleIRCMessage(msg);
    });

    this.client.on('USERNOTICE', async (msg) => {
      if (msg.isSubgift()) {
        return await this.messageHandler.handleIRCSubGift(msg);
      }

      if (msg.isSub() || msg.isResub()) {
        return await this.messageHandler.handleIRCSub(msg);
      }

      if (msg.isRaid()) {
        return await this.messageHandler.handleIRCRaid(msg);
      }
    });

    this.client.on('CLEARCHAT', async (msg) => {
      if (msg.isTimeout()) {
        return await this.messageHandler.handleIRCTimeout(msg);
      }

      if (msg.isPermaban()) {
        return await this.messageHandler.handleIRCBan(msg);
      }
    });

    this.client.on('error', async (error) => {
      //bot.logger.irc(`ERROR: ` + error);
      console.log(`ERROR: ` + error);
    });

    this.client.on('close', (error) => {
      if (error) return bot.logger.irc(`Client closed due to error: ${error}`);
      //bot.logger.irc(`Client closed without an error`);
      console.log(`Client closed without an error`);
    });

    this.client.on('NOTICE', async ({ msg, channelName, messageID }) => {
      if (!messageID) return;

      const channelId = await bot.api.gql.getUserId(channelName);

      switch (messageID) {
        case 'msg_banned': {
          await this.partChannel(channelId);
          break;
        }
        case 'msg_channel_suspended': {
          await bot.db.query(`UPDATE channels SET suspended=1 WHERE userId=?`, [channelId]);
          break;
        }
      }
    });

    this.client.on('JOIN', async ({ channelName }) => {
      const channelId = await bot.db.queryOne(`SELECT userId FROM channels WHERE login=?`, [
        channelName
      ]);
      await bot.db.query(`UPDATE channels SET suspended=0 WHERE userId=?`, [channelId]);
    });

    this.client.on('PART', async ({ channelName }) => {
      const channelId = await bot.api.gql.getUserId(channelName);
      await this.partChannel(channelId);
    });
  }

  async joinChannels() {
    try {
      const channels = await bot.db.query('SELECT login FROM channels');
      this.channels = channels.map((row) => row.login.toLowerCase());

      if (this.channels.length > 0) {
        await this.client.joinAll(this.channels);
        console.log(`Joined ${this.channels.length} channels [IRC]:`, this.channels);
      } else {
        console.log('No channels found in the database to join.');
      }
    } catch (error) {
      console.error('Error fetching or joining initial channels:', error);
    }
  }
}