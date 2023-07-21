export class OgChatMessage extends ChatMessage {
  /** @override */
  async getHTML() {
    const $html = await super.getHTML();

    if (!this.getFlag('og', 'attack') || !this.getFlag('og', 'success')) {
      return $html;
    }

    $html.html($html.html() + await renderTemplate('systems/og/templates/chat/attack/damage-button.html.hbs', {}));

    return $html;
  }

  static listeners(html) {
    html.querySelector('[data-damage]').addEventListener('click', (event) => {
      event.preventDefault();
      event.currentTarget.blur();

      const target = game.scenes.active?.tokens.get(this.getFlag('og', 'target'));
      if (!target) {
        ui.notifications.error(game.i18n.localize('OG.Errors.Attack.TargetNotExists'));

        return;
      }

      target.actor.applyDamage(this.getFlag('og', 'damage'));
    });
  }

  static onRenderMessage(app, html, data) {
    OgChatMessage._displayChatActionButtons(html[0]);
  }

  static _displayChatActionButtons(html) {
    if (!game.user.isGM) {
      return;
    }

    html.querySelectorAll('[data-action-buttons]').forEach((el) => el.classList.remove('hidden'));
  }
}
