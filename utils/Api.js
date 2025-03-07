import { Ivr } from './apis/Ivr.js';
import config from '../config.js';
import { Helix } from './apis/Helix.js';
import { Conduits } from './apis/Conduits.js';

export class Api {
  constructor() {
    // if you have a GitHub repo, do something like ${config.owner.username} (link to your repo)
    this.userAgent = `twitch bot by ${config.owner.username}`;

    this.ivr = new Ivr();
    this.helix = new Helix();
    this.conduits = new Conduits();
  }

  async fetch(url, options = {}, responseType = 'json') {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent
        },
        ...options
      });

      if (!response.ok) {
        bot.log.error(`error in ${url} (${response.status}) - ${response.statusText}`);
        return null;
      }

      if (response.status === 204) {
        return null;
      }

      switch (responseType) {
        case 'text':
          return await response.text();
        default:
          return await response.json();
      }
    } catch (error) {
      bot.log.error(`network error in ${url}: ${error.message}`);
      return null;
    }
  }
}
