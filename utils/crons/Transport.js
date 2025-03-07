import { scheduleJob } from "node-schedule";

export class Transport {
    constructor() {
      this.job = null;
    }
  
    async initialize() {
      // this executes the job every 5 minutes
      this.job = scheduleJob('*/1 * * * *', () => {
        this.checkTransport().catch((e) => {
            bot.logger.error('scheduled job checkTransport failed: ', e);
        });
      });
    }
  
    async checkTransport() {
       const [channels, modChannels] = await Promise.all([   //, authData
              bot.db.query('SELECT * FROM channels'),
              bot.twitch.helix.getModeratingChannels()
              //bot.db.query(`SELECT userId FROM userTokens`)
          ]);

          //const authChannels = new Set(authData.map(c => c.userId));
          if (!modChannels) {
              return;
          }
  
          for (const { userId, name, transport} of channels) { //, twitchBanned, botBanned 
            //   if (botBanned || twitchBanned) {
            //       continue;
            //   }
              
              if (modChannels.has(userId)) {  // || authChannels.has(userId)
                  if (transport !== `CONDUITS`) {
                      const topics = [
                          subscriptions.channelChatMessage
                      ];
  
                      await Promise.all([
                          bot.twitch.conduits.addSubscriptions(userId, topics),
                          bot.channels.update(userId, `transport`, `CONDUITS`)
                      ]);
  
                      //bot.utils.sendWebhook(config.discord.webhook5, `Rejoined ${name} after auth/mod grant via conduits`);
                  }
                  continue;
              }
  
              if (!modChannels.has(userId)) { //&& !authChannels.has(userId)
                  if (transport !== `IRC`) {
                      const topics = [
                          subscriptions.channelChatMessage
                      ];
  
                      await Promise.all([
                          bot.channels.update(userId, `transport`, `IRC`),
                          bot.twitch.conduits.removeSubscriptions(userId, topics)
                      ]);
                  }
              }
          }
    }
}