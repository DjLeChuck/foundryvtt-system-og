import { OgActorSheet } from './base-sheet.mjs';

export class OgCreatureSheet extends OgActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'attacks' }],
    });
  }

  /**
   * A convenience reference to the Actor document
   * @type {OgCreatureActor}
   */
  get actor() {
    return this.object;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    await this._prepareData(context);
    await this._prepareItems(context);

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

  async _prepareData(context) {
    context.eatingHabitsChoices = {
      carnivorous: 'OG.Creature.EatingHabits.Carnivorous',
      herbivorous: 'OG.Creature.EatingHabits.Herbivorous',
      omnivorous: 'OG.Creature.EatingHabits.Omnivorous',
    };

    context.enrichedDescription = await TextEditor.enrichHTML(context.system.description, { async: true });
  }

  /**
   * Organize and classify Items for Creature sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareItems(context) {
    const attacks = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'attack') {
        i.enrichedDamageNote = await TextEditor.enrichHTML(i.system.damageNote, { async: true });

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
