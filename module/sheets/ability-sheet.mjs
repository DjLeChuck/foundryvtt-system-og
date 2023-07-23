import { OgItemSheet } from './item-sheet.mjs';

export class OgAbilitySheet extends OgItemSheet {
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
