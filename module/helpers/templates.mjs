/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([

    // Actor partials.
    'systems/og/templates/actor/parts/actor-tab-abilities.html.hbs',
    'systems/og/templates/actor/parts/actor-abilities.html.hbs',
    'systems/og/templates/actor/parts/actor-tab-words.html.hbs',
    'systems/og/templates/actor/parts/actor-words.html.hbs',
    'systems/og/templates/actor/parts/actor-attacks.html.hbs',
    'systems/og/templates/actor/parts/actor-unggghh-points.html.hbs',
    // Item partials.
    'systems/og/templates/item/parts/item-effects.html.hbs',
  ]);
};
