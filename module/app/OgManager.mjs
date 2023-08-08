export class OgManager extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/og/templates/app/og-manager.html.hbs',
      title: game.i18n.localize('OG.Manager.Title'),
      width: 600,
      height: 'auto',
      resizable: true,
    });
  }

  constructor(options = {}) {
    super(options);

    Hooks.on('createActor', this.refreshManager);
    Hooks.on('updateActor', this.refreshManager);
    Hooks.on('deleteActor', this.refreshManager);
    Hooks.on('createItem', this.refreshManager);
  }

  async close(options = {}) {
    Hooks.off('createActor', this.refreshManager);
    Hooks.off('updateActor', this.refreshManager);
    Hooks.off('deleteActor', this.refreshManager);
    Hooks.off('createItem', this.refreshManager);

    return super.close(options);
  }

  async render(force = false, options = {}) {
    if (game.user.isGM) {
      await super.render(force, options);
    }
  }

  getData(options = {}) {
    const context = super.getData(options);

    context.characters = game.actors.filter((actor) => 'character' === actor.type);

    return context;
  }

  refreshManager = () => {
    game.og.ogManager.render(false);
  };
}
