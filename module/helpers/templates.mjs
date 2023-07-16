/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/og/templates/actor/parts/actor-features.html.hbs",
    "systems/og/templates/actor/parts/actor-items.html.hbs",
    "systems/og/templates/actor/parts/actor-spells.html.hbs",
    "systems/og/templates/actor/parts/actor-effects.html.hbs",
    // Item partials.
    "systems/og/templates/item/parts/item-effects.html.hbs",
  ]);
};
