import { BaseActor } from './base-actor.mjs';

export class CreatureActor extends BaseActor {
  getChatSpeaker() {
    return { actor: this, alias: this.system.cavemanName };
  }

  /** @override */
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    if (changed.system?.cavemanName && !foundry.utils.getProperty(changed, 'prototypeToken.name')) {
      if (!this.prototypeToken.name || this.prototypeToken.name === this.name) {
        foundry.utils.setProperty(changed, 'prototypeToken.name', changed.system.cavemanName);
      }
    }
  }
}
