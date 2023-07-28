import { OgBaseItem } from './base-item.mjs';

export class OgAbilityItem extends OgBaseItem {
  async roll() {
    ChatMessage.create({
      speaker: this.actor.getChatSpeaker(),
      rollMode: game.settings.get('core', 'rollMode'),
      content: await renderTemplate('systems/og/templates/chat/ability/chat-card.html.hbs', {
        item: this,
      }),
    });
  }
}
