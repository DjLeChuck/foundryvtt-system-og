import { OgBaseActor } from './base-actor.mjs';

export class OgCreatureActor extends OgBaseActor {
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
