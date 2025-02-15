export class Conduits {
  async getConduitId() {
    const existingConduit = (await bot.db.queryOne('SELECT id FROM conduits'))?.id;

    if (existingConduit) {
      return existingConduit;
    }

    const conduit = await createConduit();
    await bot.db.query('INSERT INTO conduits (id) VALUES (?)', [conduit.id]);

    return conduit.id;
  };

  async createConduit() {
    const body = {
      shard_count: 1
    };

    const result = await bot.api.helix.fetch('eventsub/conduits', 'POST', body);
    return result?.data?.[0] ?? null;
  }

  async addShardsToConduit(conduitId, shards) {
    const body = {
      conduit_id: conduitId,
      shards: shards
    };

    const result = await bot.api.helix.fetch('eventsub/conduits/shards', 'PATCH', body);
    return result?.data ?? null;
  }

  async createSubscription(subscriptionSettings) {
    const { type, version, condition } = subscriptionSettings;
    const payload = {
      type,
      version,
      condition,
      transport: {
        method: 'conduit',
        conduit_id: bot.conduitClient.conduitId
      }
    };

    const response = await bot.api.helix.fetch('eventsub/subscriptions', 'POST', payload);

    if (!response?.data?.length) {
      bot.log.error('Failed subscription:', payload.type, payload.version, payload.condition);
    }

    return response?.data?.[0];
  }

  async deleteSubscription(subscriptionId) {
    const endpoint = `eventsub/subscriptions?id=${subscriptionId}`;
    await Promise.all([
      bot.api.helix.fetch(endpoint, 'DELETE'),
      bot.db.query('DELETE FROM subscriptions WHERE id = ?', [subscriptionId])
    ]);
  }

  async getAllSubscriptions() {
    const subscriptions = [];
    let cursor;

    do {
      const url = `eventsub/subscriptions?after=${cursor || ''}`;

      const response = await bot.api.helix.fetch(url);
      cursor = response?.pagination?.cursor || null;

      if (response?.data?.length) {
        subscriptions.push(...response.data);
      }
    } while (cursor);

    return subscriptions;
  }

  async deleteAllSubscriptions() {
    let hasNextPage = true;

    while (hasNextPage) {
      const subscriptions = await bot.api.helix.fetch('eventsub/subscriptions');
      await Promise.all(
        subscriptions?.data.map((subscription) => this.deleteSubscription(subscription.id))
      );

      hasNextPage = JSON.stringify(subscriptions.pagination) !== '{}';
    }
  }
}
