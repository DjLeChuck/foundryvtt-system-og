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

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) {
      return;
    }

    html.find('[data-roll-attack]').click(this._onRollAttack.bind(this));
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

  async _onRollAttack(event) {
    event.preventDefault();

    const target = this._getTarget();
    if (!target) {
      return;
    }

    const attackItem = await this.actor.items.get(event.currentTarget.dataset.id);
    if (!attackItem) {
      ui.notifications.error(game.i18n.localize('OG.Errors.Attack.AttackNotFound'));

      return;
    }

    const { evade } = target.actor.system;

    await this._doRollAttack(
      evade,
      attackItem.system.accuracy,
      attackItem.system.damage,
      { evade },
    );
  }
}