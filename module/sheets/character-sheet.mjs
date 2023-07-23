import { OgActorSheet } from './actor-sheet.mjs';

export class OgCharacterSheet extends OgActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'words' }],
    });
  }

  /** @override */
  getData() {
    const context = super.getData();

    this._prepareItems(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) {
      return;
    }

    html.find('[data-configuration-roll]').click(this._onConfigurationRoll.bind(this));
    html.find('[data-open-compendium]').click(this._onOpenCompendium.bind(this));
    html.find('[data-learn-ability]').click(this._onLearnAbility.bind(this));
    html.find('[data-roll-ability]').click(this._onRollAbility.bind(this));
    html.find('[data-roll-attack]').click(this._onRollAttack.bind(this));
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
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

  /** @override */
  _onItemContext(element) {
    const item = this.actor.items.get(element.dataset.itemId);
    if (!item) {
      return;
    }

    super._onItemContext(element);

    ui.context.menuItems.unshift({
      icon: '<i class="fas fa-check"></i>',
      name: 'OG.Ability.ContextItem.Learn',
      condition: () => 'ability' === item.type && !item.system.learned,
      callback: () => item.sheet.toggleLearn(),
    }, {
      icon: '<i class="fas fa-xmark"></i>',
      name: 'OG.Ability.ContextItem.Forget',
      condition: () => 'ability' === item.type && item.system.learned,
      callback: () => item.sheet.toggleLearn(),
    });
  }

  async _onDropSingleItem(itemData) {
    if ('characterClass' === itemData.type && null !== this.actor.characterClass) {
      await this.actor.characterClass.delete();
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

      if (!itemData.system.free && this.actor.countKnownAbilities === this.actor.system.knownAbilities) {
        ui.notifications.error(game.i18n.format('OG.Errors.MaxKnownAbilitiesReached', {
          max: this.actor.system.knownAbilities,
        }));

        return false;
      }
    }

    return itemData;
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

        await this._configureSheet(roll, 'OG.CharacterClass.Notifications.HasUnggghhPoints', [
          'system.unggghhPoints.value',
          'system.unggghhPoints.max',
        ]);

        break;
      case 'knownWords':
        // 1d6+2 (Eloquent: 1d6+4, or 2 more words than any other non-Eloquent cave-man)
        bonus = this.actor.isEloquentCaveman ? 4 : 2;
        roll = new Roll(`1d6+${bonus}`);

        await this._configureSheet(roll, 'OG.CharacterClass.Notifications.KnownWords', [
          'system.knownWords',
        ]);

        break;
    }
  }

  async _configureSheet(roll, flavorMsg, actorUpdate) {
    await roll.evaluate({ async: true });

    const msg = await roll.toMessage({
      flavor: game.i18n.format(flavorMsg, {
        name: this.actor.name,
        total: roll.total,
      }),
    });

    const update = {};
    actorUpdate.forEach((key) => update[key] = roll.total);

    if (game.dice3d) {
      game.dice3d.waitFor3DAnimationByMessageID(msg.id).then(() => this.actor.update(update));
    } else {
      await this.actor.update(update);
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

  async _onLearnAbility(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;

    const ability = this.actor.items.find((item) => item._id === dataset.id && 'ability' === item.type);
    if (!ability) {
      return;
    }

    if (
      !ability.system.learned
      && !ability.system.free
      && this.actor.countKnownAbilities === this.actor.system.knownAbilities
    ) {
      ui.notifications.error(game.i18n.format('OG.Errors.MaxKnownAbilitiesReached', {
        max: this.actor.system.knownAbilities,
      }));

      return;
    }

    await ability.update({ 'system.learned': !ability.system.learned });
  }

  async _onRollAbility(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const dataset = element.dataset;

    const ability = this.actor.items.find((item) => item._id === dataset.id && 'ability' === item.type);
    if (!ability) {
      return;
    }

    if (ability.system.exclusive && !ability.system.learned) {
      ui.notifications.error(game.i18n.localize('OG.Errors.Ability.ExclusiveNotLearned'));

      return;
    }

    const aim = ability.system.learned ? 3 : 5;
    const roll = new Roll(`1d6xo6cs>=${aim}`);

    await roll.evaluate({ async: true });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: await renderTemplate('systems/og/templates/chat/ability/flavor.html.hbs', {
        wildySuccess: 2 === roll.total,
        success: 1 === roll.total,
        failure: 0 === roll.total,
        ability,
      }),
      rollMode: game.settings.get('core', 'rollMode'),
    });
  }

  /** @override */
  _getTarget() {
    const target = super._getTarget();
    if (!target) {
      return null;
    }

    if ('creature' !== target?.actor.type) {
      ui.notifications.error(game.i18n.localize('OG.Errors.Attack.TargetOnlyCreature'));

      return false;
    }

    return target;
  }

  async _onRollAttack(event) {
    event.preventDefault();

    const target = this._getTarget();
    if (!target) {
      return;
    }

    const { evade, armor } = target.actor.system;

    await this._doRollAttack(
      evade + armor,
      this.actor.system.attack,
      this.actor.system.damage,
      { evade, armor },
    );
  }
}
