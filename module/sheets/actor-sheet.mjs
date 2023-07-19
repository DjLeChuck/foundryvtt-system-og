import { onManageActiveEffect, prepareActiveEffectCategories } from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class OgActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['og', 'sheet', 'actor'],
      template: 'systems/og/templates/actor/actor-sheet.html.hbs',
      width: 620,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body' }],
    });
  }

  /** @override */
  get template() {
    return `systems/og/templates/actor/actor-${this.actor.type}-sheet.html.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type === 'character') {
      this._prepareCharacterItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare Creature data and items.
    if (actorData.type === 'creature') {
      this._prepareCreatureItems(context);
      this._prepareCreatureData(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  _prepareCharacterData(context) {
  }

  _prepareCreatureData(context) {
    context.eatingHabitsChoices = {
      carnivorous: 'OG.Creature.EatingHabits.Carnivorous',
      herbivorous: 'OG.Creature.EatingHabits.Herbivorous',
      omnivorous: 'OG.Creature.EatingHabits.Omnivorous',
    };
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(context) {
    let characterClass = null;
    const words = [];
    const abilities = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'word') {
        words.push(i);
      } else if (i.type === 'ability') {
        abilities.push(i);
      } else if (i.type === 'characterClass') {
        characterClass = i;
      }
    }

    context.words = words;
    context.abilities = abilities;
    context.characterClass = characterClass;
  }

  /**
   * Organize and classify Items for Creature sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCreatureItems(context) {
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

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find('.effect-control').click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('[data-configuration-roll]').click(this._onConfigurationRoll.bind(this));
    html.find('[data-open-compendium]').click(this._onOpenCompendium.bind(this));
    html.find('[data-delete-item]').click(this._onDeleteItem.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    let items = itemData instanceof Array ? itemData : [itemData];
    const toCreate = [];
    for (const item of items) {
      const result = await this._onDropSingleItem(item);

      if (result) {
        toCreate.push(result);
      }
    }

    // Create the owned items as normal
    return this.actor.createEmbeddedDocuments('Item', toCreate);
  }

  /* -------------------------------------------- */

  /**
   * Handles dropping of a single item onto this character sheet.
   * @param {object} itemData            The item data to create.
   * @returns {Promise<object|boolean>}  The item data to create after processing, or false if the item should not be
   *                                     created or creation has been otherwise handled.
   * @protected
   */
  async _onDropSingleItem(itemData) {
    if ('characterClass' === itemData.type && null !== this.actor.characterClass) {
      this.actor.characterClass.delete();
    } else if ('word' === itemData.type) {
      const alreadyKnown = this.actor.items.find((item) => item.getFlag('core', 'sourceId') === itemData.flags?.core?.sourceId);
      if (alreadyKnown) {
        ui.notifications.error(game.i18n.format('OG.Errors.WordAlreadyKnown', { name: itemData.name }));

        return false;
      }

      if (this.actor.countKnownWords === this.actor.system.knownWords) {
        ui.notifications.error(game.i18n.format('OG.Errors.MaxKnownWordsReached', {
          max: this.actor.system.knownWords,
        }));

        return false;
      }
    } else if ('ability' === itemData.type) {
      const alreadyKnown = this.actor.items.find((item) => item.getFlag('core', 'sourceId') === itemData.flags?.core?.sourceId);
      if (alreadyKnown) {
        ui.notifications.error(game.i18n.format('OG.Errors.AbilityAlreadyKnown', { name: itemData.name }));

        return false;
      }

      if (this.actor.countKnownAbilities === this.actor.system.knownAbilities) {
        ui.notifications.error(game.i18n.format('OG.Errors.MaxKnownAbilitiesReached', {
          max: this.actor.system.knownAbilities,
        }));

        return false;
      }
    }

    return itemData;
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async _onConfigurationRoll(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;

    let roll;
    let bonus;

    switch (dataset.type) {
      case 'unggghhPoints':
        // 1d6+3 (Thoug 1d6+6, or get X+3 from highest score)
        bonus = this.actor.isToughCaveman ? 6 : 3;
        roll = new Roll(`1d6+${bonus}`);
        await roll.evaluate({ async: true });

        await roll.toMessage({
          flavor: game.i18n.format('OG.CharacterClass.Notifications.HasUnggghhPoints', {
            name: this.actor.name,
            total: roll.total,
          }),
        });

        this.actor.update({
          'system.unggghhPoints.value': roll.total,
          'system.unggghhPoints.max': roll.total,
        });

        break;
      case 'knownWords':
        // 1d6+2 (Eloquent: 1d6+4, or 2 more words than any other non-Eloquent cave-man)
        bonus = this.actor.isEloquentCaveman ? 4 : 2;
        roll = new Roll(`1d6+${bonus}`);
        await roll.evaluate({ async: true });

        await roll.toMessage({
          flavor: game.i18n.format('OG.CharacterClass.Notifications.KnownWords', {
            name: this.actor.name,
            total: roll.total,
          }),
        });

        this.actor.update({
          'system.knownWords': roll.total,
        });

        break;
    }
  }

  async _onOpenCompendium(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;

    const compendium = game.packs.find((pack) => `og.${dataset.name}` === pack.metadata.id);
    if (!compendium) {
      ui.notifications.error(game.i18n.format('OG.Errors.CompendiumNotFound', { name: dataset.name }));

      return;
    }

    compendium.render(true);
  }

  async _onDeleteItem(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;

    const item = await this.actor.items.get(dataset.id);
    if (item) {
      await item.delete();
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType === 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
