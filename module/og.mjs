import { OgChatMessage } from './documents/chat-message.mjs';
import * as actor from './actor/_module.mjs';
import * as item from './item/_module.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.og = {
    rollItemMacro,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d6 + @evade',
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = actor.documents.BaseActor;
  CONFIG.ChatMessage.documentClass = OgChatMessage;
  CONFIG.Item.documentClass = item.documents.BaseItem;

  game.system.og = {
    actorClasses: {
      character: actor.documents.CharacterActor,
      creature: actor.documents.CreatureActor,
    },
    itemClasses: {
      ability: item.documents.AbilityItem,
      attack: item.documents.AttackItem,
      characterClass: item.documents.CharacterClassItem,
      skill: item.documents.SkillItem,
      word: item.documents.WordItem,
    },
  };

  // Register custom Data Model
  CONFIG.Actor.dataModels.character = actor.models.CharacterDataModel;
  CONFIG.Actor.dataModels.creature = actor.models.CreatureDataModel;
  CONFIG.Item.dataModels.ability = item.models.AbilityDataModel;
  CONFIG.Item.dataModels.attack = item.models.AttackDataModel;
  CONFIG.Item.dataModels.characterClass = item.models.CharacterClassDataModel;
  CONFIG.Item.dataModels.skill = item.models.SkillDataModel;
  CONFIG.Item.dataModels.word = item.models.WordDataModel;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('og', actor.sheets.CharacterActorSheet, {
    types: ['character'],
    makeDefault: true,
  });
  Actors.registerSheet('og', actor.sheets.CreatureActorSheet, {
    types: ['creature'],
    makeDefault: true,
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('og', item.sheets.AbilityItemSheet, {
    types: ['ability'],
    makeDefault: true,
  });
  Items.registerSheet('og', item.sheets.AttackItemSheet, {
    types: ['attack'],
    makeDefault: true,
  });
  Items.registerSheet('og', item.sheets.CharacterClassItemSheet, {
    types: ['characterClass'],
    makeDefault: true,
  });
  Items.registerSheet('og', item.sheets.SkillItemSheet, {
    types: ['skill'],
    makeDefault: true,
  });
  Items.registerSheet('og', item.sheets.WordItemSheet, {
    types: ['word'],
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

  if (typeof Babele !== 'undefined') {
    Babele.get().setSystemTranslationsDir('packs/translations');

    Babele.get().registerConverters({
      'creatureAttack': (items, translations) => {
        if (!translations) {
          return items;
        }

        return items.map((item) => {
          if ('attack' !== item.type || !translations[item.name]) {
            return item;
          }

          const translation = translations[item.name];

          item.name = translation.name;

          if (item.description && translation.description) {
            item.description = translation.description;
          }

          if (item.system.damageNote && translation.damageNote) {
            item.system.damageNote = translation.damageNote;
          }

          return item;
        });
      },
    });
  }

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
