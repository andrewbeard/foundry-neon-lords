/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/neon-lords/templates/actor/parts/actor-attacks.hbs',
    'systems/neon-lords/templates/actor/parts/actor-effects.hbs',
    'systems/neon-lords/templates/actor/parts/actor-features.hbs',
    'systems/neon-lords/templates/actor/parts/actor-gear.hbs',
    'systems/neon-lords/templates/actor/parts/actor-mutations.hbs',
    'systems/neon-lords/templates/actor/parts/actor-spells.hbs',
    // Item partials
    'systems/neon-lords/templates/item/parts/item-effects.hbs',
  ]);
};
