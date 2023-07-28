import { OgChatMessage } from './documents/chat-message.mjs';
import { OgBaseItem } from './documents/item/base-item.mjs';
import { OgAbilityItem } from './documents/item/ability-item.mjs';
import { OgAttackItem } from './documents/item/attack-item.mjs';
import { OgCharacterClassItem } from './documents/item/character-class-item.mjs';
import { OgSkillItem } from './documents/item/skill-item.mjs';
import { OgWordItem } from './documents/item/word-item.mjs';
import { OgAbilitySheet } from './sheets/ability-sheet.mjs';
import { OgAttackSheet } from './sheets/attack-sheet.mjs';
import { OgWordSheet } from './sheets/word-sheet.mjs';
import { OgItemSheet } from './sheets/item-sheet.mjs';
import * as actor from './actor/_module.mjs';
import { AbilityData } from './dataModels/item/AbilityData.mjs';
import { AttackData } from './dataModels/item/AttackData.mjs';
import { CharacterClassData } from './dataModels/item/CharacterClassData.mjs';
import { SkillData } from './dataModels/item/SkillData.mjs';
import { WordData } from './dataModels/item/WordData.mjs';
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
  CONFIG.Actor.documentClass = actor.documents.OgBaseActor;
  CONFIG.ChatMessage.documentClass = OgChatMessage;
  CONFIG.Item.documentClass = OgBaseItem;

  game.system.og = {
    actorClasses: {
      character: actor.documents.OgCharacterActor,
      creature: actor.documents.OgCreatureActor,
    },
    itemClasses: {
      ability: OgAbilityItem,
      attack: OgAttackItem,
      characterClass: OgCharacterClassItem,
      skill: OgSkillItem,
      word: OgWordItem,
    },
  };

  // Register custom Data Model
  CONFIG.Actor.dataModels.character = actor.models.OgCharacterData;
  CONFIG.Actor.dataModels.creature = actor.models.OgCreatureData;
  CONFIG.Item.dataModels.ability = AbilityData;
  CONFIG.Item.dataModels.attack = AttackData;
  CONFIG.Item.dataModels.characterClass = CharacterClassData;
  CONFIG.Item.dataModels.skill = SkillData;
  CONFIG.Item.dataModels.word = WordData;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('og', actor.sheets.OgCharacterSheet, {
    types: ['character'],
    makeDefault: true,
  });
  Actors.registerSheet('og', actor.sheets.OgCreatureSheet, {
    types: ['creature'],
    makeDefault: true,
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('og', OgAbilitySheet, {
    types: ['ability'],
    makeDefault: true,
  });
  Items.registerSheet('og', OgAttackSheet, {
    types: ['attack'],
    makeDefault: true,
  });
  Items.registerSheet('og', OgWordSheet, {
    types: ['word'],
    makeDefault: true,
  });
  Items.registerSheet('og', OgItemSheet, {
    types: ['characterClass', 'skill'],
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
