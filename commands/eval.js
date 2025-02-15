export default {
  name: 'eval',
  description: 'evaluates a given js code',
  access: bot.permissions.dev,
  usage: '<code>',
  async execute(msg, response) {
    if (!msg.args.length) {
      return response(`usage: ${msg.prefix}${msg.command.trigger} ${this.usage}`);
    }

    try {
      const result = await eval(`(async () => {
				${msg.text}
			})()`);

      if (result !== undefined) {
        if (typeof result === 'object') {
          return response(JSON.stringify(result));
        }

        return response(String(result));
      }
    } catch (e) {
      bot.log.error(e);
      return response(`FeelsDankMan error ${e}`);
    }
  }
};
