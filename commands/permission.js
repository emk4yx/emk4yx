import config from '../config.js';

export default {
  name: 'permission',
  description: 'get/update a users permission',
  cooldown: bot.cooldown.short,
  usage: '<status | default | admin> <user>',
  async execute(msg, response) {
    if (!msg.args.length) {
      return response(`usage: ${this.usage}`, { error: true });
    }

    const permission = msg.args[0].toLowerCase();
    const user = bot.utils.sanitizeUser(msg.args[1], msg.user.login);

    const userId = await bot.api.ivr.getUserId(user);
    if (!userId) {
      return response(`FeelsDankMan user ${user} not found`);
    }

    const isCurrentUser = userId === msg.user.id;

    const currentPermission = bot.permissions.get(userId);
    const currentPermissionName = Object.keys(bot.permissions.list).find(
      (key) => bot.permissions.list[key] === currentPermission
    );

    if (permission === 'status') {
      const userText = isCurrentUser ? 'your' : `${bot.utils.antiPing(user)}'s`;
      return response(`${userText} current permission is ${currentPermissionName}`);
    }

    if (msg.user.perms < bot.permissions.admin) {
      return response('NOIDONTTHINKSO you have to be an admin to update permissions');
    }

    if (userId === config.owner.userId) {
      return response(`NOIDONTTHINKSO you can't update the owner's permission`);
    }

    if (permission === 'owner') {
      return response('NOIDONTTHINKSO you cannot give another user owner permissions');
    }

    const permissionId = bot.permissions.list[permission];
    if (permissionId === undefined) {
      return response(
        `FeelsDankMan permission ${permission} doesn't exist. ${bot.utils.joinMessage(Object.keys(bot.permissions.list), ', ')}`
      );
    }

    if (currentPermission === permissionId) {
      return response(
        `FeelsDankMan user ${bot.utils.antiPing(user)} already has the permission ${permission}`
      );
    }

    await bot.permissions.set(userId, permissionId);
    return response(`user ${bot.utils.antiPing(user)} now has the permission ${permission}`);
  }
};
