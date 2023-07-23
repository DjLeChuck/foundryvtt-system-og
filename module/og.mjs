import { OgActor } from './documents/actor.mjs';
import { OgChatMessage } from './documents/chat-message.mjs';
import { OgItem } from './documents/item.mjs';
import { OgCharacterSheet } from './sheets/character-sheet.mjs';
import { OgCreatureSheet } from './sheets/creature-sheet.mjs';
import { OgAbilitySheet } from './sheets/ability-sheet.mjs';
import { OgItemSheet } from './sheets/item-sheet.mjs';
import { CharacterData } from './dataModels/actor/CharacterData.mjs';
import { CreatureData } from './dataModels/actor/CreatureData.mjs';
import { AbilityData } from './dataModels/item/AbilityData.mjs';
import { AttackData } from './dataModels/item/AttackData.mjs';
import { CharacterClassData } from './dataModels/item/CharacterClassData.mjs';
import { SkillData } from './dataModels/item/SkillData.mjs';
import { WordData } from './dataModels/item/WordData.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { OG } from './helpers/config.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.og = {
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.OG = OG;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d6 + @evade',
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = OgActor;
  CONFIG.ChatMessage.documentClass = OgChatMessage;
  CONFIG.Item.documentClass = OgItem;

  // Register custom Data Model
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.creature = CreatureData;
  CONFIG.Item.dataModels.ability = AbilityData;
  CONFIG.Item.dataModels.attack = AttackData;
  CONFIG.Item.dataModels.characterClass = CharacterClassData;
  CONFIG.Item.dataModels.skill = SkillData;
  CONFIG.Item.dataModels.word = WordData;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('og', OgCharacterSheet, {
    types: ['character'],
    makeDefault: true,
  });
  Actors.registerSheet('og', OgCreatureSheet, {
    types: ['creature'],
    makeDefault: true,
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('og', OgAbilitySheet, {
    types: ['ability'],
    makeDefault: true,
  });
  Items.registerSheet('og', OgItemSheet, {
    types: ['attack', 'characterClass', 'skill', 'word'],
    makeDefault: true,
  });

  // Load fonts
  CONFIG.fontDefinitions['StoneyBilly'] = {
    editor: true,
    fonts: [
      { urls: ['/systems/og/assets/fonts/stoney-billy.ttf'] },
    ],
  };
  CONFIG.fontDefinitions['OutbackITC'] = {
    editor: true,
    fonts: [
      { urls: ['/systems/og/assets/fonts/outback-itc.ttf'] },
    ],
  };
  CONFIG.fontDefinitions['HoeflerText'] = {
    editor: true,
    fonts: [
      { urls: ['/systems/og/assets/fonts/hoefler-text.ttf'] },
    ],
  };

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('length', function (value) {
  return value.length;
});

Handlebars.registerHelper('abilityUsable', function (ability) {
  return ability.system.learned || !ability.system.exclusive;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') {
    return;
  }

  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn('You can only create macro buttons for owned Items');
  }

  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.og.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'og.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}
