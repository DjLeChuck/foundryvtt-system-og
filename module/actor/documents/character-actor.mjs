import { BaseActor } from './base-actor.mjs';

export class CharacterActor extends BaseActor {
  /**
   * Get the actor character class item.
   *
   * @returns {CharacterClassItem|null}
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

  get isGruntingCaveman() {
    return this.characterClass?.getFlag('og', 'isGrunting') ?? false;
  }

  get isStrongCaveman() {
    return this.characterClass?.getFlag('og', 'isStrong') ?? false;
  }

  /**
   * @returns {number}
   */
  get knownWords() {
    return this.items
      .search({ filters: [{ field: 'type', value: 'word' }] })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { ignorePunctuation: true }));
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
