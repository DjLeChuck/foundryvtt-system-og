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

  getData(options = {}) {
    const context = super.getData(options);

    context.characters = game.actors.search({ filters: [{ field: 'type', value: 'character' }] });

    return context;
  }
}
