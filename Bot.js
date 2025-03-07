import { readdirSync } from 'fs';
import { Api } from './utils/Api.js';
import { ConduitClient } from './utils/ConduitClient.js';
import { Cooldown } from './utils/cooldown.js';
import { Database } from './utils/Database.js';
import { Logger } from './utils/Logger.js';
import { Permissions } from './utils/permissions.js';
import { Utils } from './utils/utils.js';
import { Stats } from './utils/Stats.js';
import { Channels } from './utils/Channels.js';
import { IrcClient } from './utils/IrcClient.js';
import { IrcMessageHandler } from './utils/IrcMessageHandler.js';
import { Crons } from './utils/Crons.js';

export class Bot {
  constructor() {
    this.log = new Logger();

    this.api = new Api();
    this.db = new Database();
    this.ircclient = new IrcClient();
    this.ircmessagehandler = new IrcMessageHandler();
    this.crons = new Crons();

    this.utils = new Utils();
    this.stats = new Stats();

    this.conduitClient = new ConduitClient();
    this.permissions = new Permissions();
    this.cooldown = new Cooldown();

    this.commands = new Map();
    this.channels = new Channels();
  }

  async initialize() {
    await Promise.all([
      this.loadCommands(),
      this.channels.initialize(),
      this.permissions.initialize(),
      this.crons.initialize(),
      this.conduitClient.initialize(),
      this.ircclient.initialize(),
    ]);
  }

  async loadCommands() {
    const commandFiles = readdirSync(`./commands`).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = await import(`./commands/${file}?${Date.now()}`);

      if (!command?.default?.name) {
        this.log.error(`failed to load Command ${file}`);
        continue;
      }

      this.commands[command.default.name] = command.default;

      for (const alias of command.default.aliases || []) {
        this.commands[alias] = this.commands[command.default.name];
      }
    }
  }
}
