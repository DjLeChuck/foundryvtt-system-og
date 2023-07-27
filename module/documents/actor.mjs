/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class OgActor extends Actor {
  /**
   * Get the actor character class item.
   *
   * @returns {OgItem|null}
   */
  get characterClass() {
    if (!['character'].includes(this.type)) {
      return null;
    }

    return this.items.find((item) => 'characterClass' === item.type) ?? null;
  }

  get isToughCaveman() {
    return this.characterClass?.getFlag('og', 'isTough') ?? false;
  }

  get isEloquentCaveman() {
    return this.characterClass?.getFlag('og', 'isEloquent') ?? false;
  }

  /**
   * Count knowns words. If it’s a common one, then it counts for 1, else for 2.
   *
   * @returns {number}
   */
  get countKnownWords() {
    if (!['character'].includes(this.type)) {
      return 0;
    }

    return this.items.reduce((accumulator, item) => 'word' === item.type
        ? accumulator + (item.system.common ? 1 : 2)
        : accumulator
      , 0);
  }

  /**
   * Count knowns abilities.
   *
   * @returns {number}
   */
  get countKnownAbilities() {
    if (!['character'].includes(this.type)) {
      return 0;
    }

    return this.items.reduce((accumulator, item) => 'ability' === item.type
        ? accumulator + (item.system.free || !item.system.learned ? 0 : 1)
        : accumulator
      , 0);
  }

  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount.toString()) * multiplier);
    const hp = this.system.unggghhPoints;
    if (!hp) {
      return this;
    }

    // Remaining goes to health
    const dh = Math.clamped(hp.value - amount, 0, Math.max(0, hp.max));

    // Update the Actor
    this.update({
      'system.unggghhPoints.value': dh,
    });
  }

  getChatSpeaker() {
    if (!['creature'].includes(this.type)) {
      return ChatMessage.getSpeaker({ actor: this });
    }

    return { actor: this, alias: this.system.cavemanName };
  }

  /** @override */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    if ('character' !== data.type) {
      return;
    }

    const abilities = await game.packs.get('og.abilities').getDocuments();
    const items = [];

    abilities.forEach((item) => items.push(foundry.utils.duplicate(item)));

    items.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    this.updateSource({
      items,
    });
  }

  /** @override */
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    if ('creature' !== this.type) {
      return;
    }

    if (changed.system?.cavemanName && !foundry.utils.getProperty(changed, 'prototypeToken.name')) {
      if (!this.prototypeToken.name || this.prototypeToken.name === this.name) {
        foundry.utils.setProperty(changed, 'prototypeToken.name', changed.system.cavemanName);
      }
    }
  }
}
