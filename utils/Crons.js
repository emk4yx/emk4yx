import { Transport } from './crons/Transport.js';

export class Crons {
    constructor() {
      this.transport = new Transport();
  }
  
    async initialize() {
      await Promise.all([
         this.transport.initialize()
      ]);
    }
  }