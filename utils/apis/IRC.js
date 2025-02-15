import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, ConnectionRateLimiter, JoinRateLimiter } from '@kararty/dank-twitch-irc';
import config from '../../config.js';

export class IRC {
  constructor() {
    this.client = null;
    this.channels = [];
  }

  async initialize() {
    try {
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

      this.client.on('connect', () => {
        console.log('IRC client successfully connected!');
      });

      this.client.on('ready', async () => {
        console.log('IRC client is ready!');
        await this.joinInitialChannels();
      });
      await this.client.connect();
//      this.client.on('close', (err) => console.error('IRC client disconnected:', err));

    } catch (error) {
      console.error('Failed to initialize IRC client:', error);
      throw error;
    }
  }


  async joinInitialChannels() {
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


  async sendMessage(channel, message) {
    if (!this.client) {
      throw new Error('IRC client is not initialized');
    }
    this.client.say(channel, message);
  }


  async sendAction(channel, action, parentMessageID = '') {
    if (!this.client) {
      throw new Error('IRC client is not initialized');
    }

    const rawCommand = parentMessageID
      ? `@reply-parent-msg-id=${parentMessageID} PRIVMSG #${channel} :/me ${action}`
      : `PRIVMSG #${channel} :/me ${action} THIS WAS SENT USING IRC (TESTING)`;

    await this.client.sendRaw(rawCommand);
  }


  async joinChannel(channel) {
    try {
      await this.client.join(channel);
      this.channels.push(channel.toLowerCase());
      console.log(`Joined channel: ${channel}`);
    } catch (error) {
      console.error(`Failed to join channel ${channel}:`, error);
    }
  }

  async leaveChannel(channel) {
    try {
      await this.client.part(channel);
      this.channels = this.channels.filter((ch) => ch !== channel.toLowerCase());
      console.log(`Left channel: ${channel}`);
    } catch (error) {
      console.error(`Failed to leave channel ${channel}:`, error);
    }
  }


  async disconnect() {
    try {
      await this.client.quit();
      console.log('IRC client disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect IRC client:', error);
    }
  }
}

export default IRC;
