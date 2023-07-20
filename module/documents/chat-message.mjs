export class OgChatMessage extends ChatMessage {
  /** @override */
  async getHTML() {
    const $html = await super.getHTML();

    if (!this.getFlag('og', 'attack') || !this.getFlag('og', 'success')) {
      return $html;
    }

    $html.html($html.html() + await renderTemplate('systems/og/templates/chat/attack/damage-button.html.hbs', {}));

    $html[0].querySelector('[data-damage]').addEventListener('click', (event) => {
      event.preventDefault();
      event.currentTarget.blur();

      const target = game.scenes.active?.tokens.get(this.getFlag('og', 'target'));
      if (!target) {
        ui.notifications.error(game.i18n.localize('OG.Errors.Attack.TargetNotExists'));

        return;
      }

      target.actor.applyDamage(this.getFlag('og', 'damage'));
    });

    return $html;
  }
}
