import { OgBaseActor } from './base-actor.mjs';

export class OgCharacterActor extends OgBaseActor {
  /**
   * Get the actor character class item.
   *
   * @returns {OgCharacterClassItem|null}
   */
  get characterClass() {
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
    return this.items.reduce((accumulator, item) => 'ability' === item.type
        ? accumulator + (item.system.free || !item.system.learned ? 0 : 1)
        : accumulator
      , 0);
  }

  /** @override */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

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
}
