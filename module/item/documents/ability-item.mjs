import { BaseItem } from './base-item.mjs';

export class AbilityItem extends BaseItem {
  async roll() {
    ChatMessage.create({
      speaker: this.actor.getChatSpeaker(),
      rollMode: game.settings.get('core', 'rollMode'),
      content: await renderTemplate('systems/og/templates/chat/ability/chat-card.html.hbs', {
        item: this,
      }),
    });
  }

  get rollAim() {
    if (!this.system.learned) {
      return 5;
    }

    if (this.getFlag('og', 'isLift') && this.actor.isStrongCaveman) {
      return 1;
    }

    if (this.getFlag('og', 'isResistance') && this.actor.isToughCaveman) {
      return 1;
    }

    return 3;
  }
}
