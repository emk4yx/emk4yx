import { Bot } from './Bot.js';

(() => {
  global.bot = new Bot();

  bot.initialize().then(() => bot.log.info('Bot initialized'));
})();
