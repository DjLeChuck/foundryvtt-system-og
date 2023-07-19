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
    if (!['character'].includes(this.type)) return null;

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
    if (!['character'].includes(this.type)) return 0;

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
    if (!['character'].includes(this.type)) return 0;

    return this.items.reduce((accumulator, item) => 'ability' === item.type
        ? accumulator + (item.system.free ? 0 : 1)
        : accumulator
      , 0);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.og || {};

    // Make separate methods for each Actor type (character, creature, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareCreatureData(actorData);
  }

  /** @override */
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    if (data.type !== 'character') return;

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

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
  }

  /**
   * Prepare Creature type specific data.
   */
  _prepareCreatureData(actorData) {
    if (actorData.type !== 'creature') return;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getCreatureRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
  }

  /**
   * Prepare creature roll data.
   */
  _getCreatureRollData(data) {
    if (this.type !== 'creature') return;
  }
}
