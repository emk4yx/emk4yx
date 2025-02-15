import { ConduitShardClient } from './ConduitShardClient.js';
import * as subscriptions from './subscriptions.js';
import config from '../config.js';

export class ConduitClient {
  topics = [
    subscriptions.channelChatMessage,
    subscriptions.streamOnline,
    subscriptions.streamOffline
  ];

  botTopics = [subscriptions.userWhisperMessage];

  constructor() {
    this.conduitId = null;
    this.shard = new ConduitShardClient();
  }

  async initialize() {
    this.conduitId = await bot.api.conduits.getConduitId();
    bot.log.twitch('twitch-id: ', this.conduitId);

    await this.shard.initialize();
    bot.log.twitch('shard initialized');

    const shard = {
      id: 0,
      transport: {
        method: 'websocket',
        session_id: this.shard.sessionId
      }
    };

    await bot.api.conduits.addShardsToConduit(this.conduitId, [shard]);

    await Promise.all([
      this.subscribeToEvents([config.bot.userId]),
      this.subscribeToEvents(bot.channels.getAll())
    ]);
  }

  async addSubscriptions(channelId, subscriptionTopics) {
    for (const topic of subscriptionTopics) {
      const conditionStr = JSON.stringify(topic.condition).replace(/{channelId}/g, channelId);
      const subscriptionSettings = {
        type: topic.type,
        version: topic.version,
        condition: JSON.parse(conditionStr)
      };

      const subscriptionExists = await bot.db.entryExists(
        'SELECT id FROM subscriptions WHERE type = ? AND version = ? AND channelId = ?',
        [topic.type, topic.version, channelId]
      );
      if (subscriptionExists) {
        continue;
      }

      const subscriptionResponse = await bot.api.conduits.createSubscription(subscriptionSettings);
      if (subscriptionResponse?.id) {
        await bot.db.query(
          'INSERT INTO subscriptions (id, type, version, channelId) VALUES (?, ?, ?, ?)',
          [subscriptionResponse.id, topic.type, topic.version, channelId]
        );
      }
    }
  }

  async removeSubscriptions(channelId, subscriptionTopics) {
    for (const topic of subscriptionTopics) {
      const subscription = await bot.db.queryOne(
        'SELECT id FROM subscriptions WHERE channelId = ? AND type = ?',
        [channelId, topic.type]
      );
      if (subscription) {
        await bot.api.conduits.deleteSubscription(subscription.id);
        await bot.db.query('DELETE FROM subscriptions WHERE id = ?', [subscription.id]);
      }
    }
  }

  async subscribeToEvents(channelIds, subscriptionTopics = this.topics) {
    for (const channelId of channelIds) {
      await this.addSubscriptions(channelId, subscriptionTopics);
    }
  }

  async unsubscribeFromEvents(channelIds, subscriptionTopics = this.topics) {
    for (const channelId of channelIds) {
      await this.removeSubscriptions(channelId, subscriptionTopics);
    }
  }
}