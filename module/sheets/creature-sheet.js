import { OgActorSheet } from './actor-sheet.mjs';

export class OgCreatureSheet extends OgActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attacks' }],
    });
  }

  /** @override */
  getData() {
    const context = super.getData();

    this._prepareData(context);
    this._prepareItems(context);

    return context;
  }

  _prepareData(context) {
    context.eatingHabitsChoices = {
      carnivorous: 'OG.Creature.EatingHabits.Carnivorous',
      herbivorous: 'OG.Creature.EatingHabits.Herbivorous',
      omnivorous: 'OG.Creature.EatingHabits.Omnivorous',
    };
  }

  /**
   * Organize and classify Items for Creature sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    const attacks = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'attack') {
        attacks.push(i);
      }
    }

    context.attacks = attacks;
  }
}
