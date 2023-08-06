import { BaseItemSheet } from './base-item-sheet.mjs';

export class AbilityItemSheet extends BaseItemSheet {
  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = await super.getData();
    const itemData = context.item;

    context.enrichedDescription = await TextEditor.enrichHTML(itemData.system.description, { async: true });

    return context;
  }

  async toggleLearn() {
    if (
      !this.item.system.learned
      && !this.item.system.free
      && this.actor.countKnownAbilities === this.actor.system.knownAbilities
    ) {
      ui.notifications.error(game.i18n.format('OG.Errors.MaxKnownAbilitiesReached', {
        max: this.actor.system.knownAbilities,
      }));

      return;
    }

    await this.item.update({ 'system.learned': !this.item.system.learned });
  }
}
