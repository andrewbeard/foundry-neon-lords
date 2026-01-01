// Import document classes.
import { NeonLordsActor } from './documents/actor.mjs';
import { NeonLordsItem } from './documents/item.mjs';
// Import sheet classes.
import { NeonLordsActorSheet } from './sheets/actor-sheet.mjs';
import { NeonLordsItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { NEON_LORDS } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.neonlords = {
    NeonLordsActor,
    NeonLordsItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.NEON_LORDS = NEON_LORDS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d6',
    decimals: 1,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = NeonLordsActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.NeonLordsCharacter,
    npc: models.NeonLordsNPC
  }
  CONFIG.Item.documentClass = NeonLordsItem;
  CONFIG.Item.dataModels = {
    attack: models.NeonLordsAttack,
    feature: models.NeonLordsFeature,
    gear: models.NeonLordsGear,
    hairstyle: models.NeonLordsHairstyle,
    mutation: models.NeonLordsMutation,
    spell: models.NeonLordsSpell
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  const Actors = foundry.documents.collections.Actors;
  const Items = foundry.documents.collections.Items;

  // Register sheet application classes
  Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  Actors.registerSheet('neon-lords', NeonLordsActorSheet, {
    makeDefault: true,
    label: 'NEON_LORDS.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  Items.registerSheet('neon-lords', NeonLordsItemSheet, {
    makeDefault: true,
    label: 'NEON_LORDS.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});  

Hooks.on('init', function () {
    const percentRgx = /\[\[\s*\/percent\s+(\d+)\]\]?/gi;
    CONFIG.TextEditor.enrichers.push({
        pattern: percentRgx,
        enricher: percentRollEnricher,
    });

    const saveRgx = /\[\[\s*\/save\s+(\w+)\]\]?/gi;
    CONFIG.TextEditor.enrichers.push({
        pattern: saveRgx,
        enricher: saveRollEnricher,
    });

    const skillRgx = /\[\[\s*\/skill\s+(\w+)\]\]?/gi;
    CONFIG.TextEditor.enrichers.push({
        pattern: skillRgx,
        enricher: skillRollEnricher,
    });

    const spellRgx = /\[\[\s*\/spell\s*\]\]?/gi;
    CONFIG.TextEditor.enrichers.push({
        pattern: spellRgx,
        enricher: spellRollEnricher,
    });

    const body = $("body");
    body.on("click", "a.inline-percent-roll", onRollPercentClick);
    body.on("click", "a.inline-save-roll", onRollSaveClick);
    body.on("click", "a.inline-skill-roll", onRollSkillClick);
    body.on("click", "a.inline-spell-roll", onRollSpellClick);
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});

Handlebars.registerHelper('capitalizeFirstLetter', function (str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
});

Handlebars.registerHelper('showSign', function (num) {
    return new Intl.NumberFormat("en-US", { signDisplay: "always"}).format(num);
});

Handlebars.registerHelper('isChecked', function (value) {
    return value ? 'checked' : '';
});

/* -------------------------------------------- */
/*  Item Hooks                                  */
/* -------------------------------------------- */

Hooks.on("preCreateItem", (item, data, options, userId) => {
    // Only process if this is a hairstyle item
    if (item.type !== "hairstyle") return true;
  
    // Check if this is being added to an actor
    const actor = item.parent;
    if (!actor) return true;
  
    // Find existing hairstyle items
    const existingHairstyle = actor.items.find(i => i.type === "hairstyle");
    
    if (existingHairstyle) {
      // Delete the existing hairstyle before adding the new one
      actor.deleteEmbeddedDocuments("Item", [existingHairstyle.id]);
      ui.notifications.info(`Replaced hairstyle ${existingHairstyle.name} with ${item.name}`);
    }
  
    return true;
  });

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
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
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.neonlords.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'neon-lords.itemMacro': true },
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
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

function percentRollEnricher(match, options) {
  const percent = parseInt(match[1]);

  const a = document.createElement("a");
  a.classList.add("inline-percent-roll");
  a.dataset.percent = percent;
  a.innerHTML = `<i class="fas fa-dice-d20"></i>${percent}%`;
  return a;
}

async function rollPercent(rollInfo, actor = null) {
  let rollMod = "";
  if (rollInfo?.modifier) {
    rollMod += ` +${rollInfo.modifier}`;
  }
  const roll = new Roll("d100");
  const result = await roll.evaluate();

  const resultText = result.total <= rollInfo.label 
    ? `<span style="color: #009900; font-weight: bold;">✓ Success!</span> (${result.total} < ${rollInfo.label})`
    : `<span style="color: #990000; font-weight: bold;">✗ Failure!</span> (${result.total} ≥ ${rollInfo.label})`;

  const enrichedResultText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(resultText, {
    async: true,
    rollData: actor ? this.getRollData() : null,
    relativeTo: this,
  });

  if (actor) {
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `${rollInfo.label}%<br>${enrichedResultText}`,
      rollMode: game.settings.get("core", "rollMode")
    });
  } else {
    roll.toMessage({
      flavor: `${rollInfo.label}%<br>${enrichedResultText}`,
      rollMode: game.settings.get("core", "rollMode")
    });
  }
}

async function onRollPercentClick(event) {
  const actors = getCharacterOrTokens();
  if (actors.length) {
    actors.forEach(async (actor) => {
      await rollPercent({label: event.target.dataset.percent}, actor);
    });
  }
  else {
    await rollPercent({label: event.target.dataset.percent});
  }
}

function saveRollEnricher(match, options) {
  const saveType = capitalizeFirstLetter(match[1].toLowerCase());

  const a = document.createElement("a");
  a.classList.add("inline-save-roll");
  a.dataset.saveType = saveType;
  a.innerHTML = `<i class="fas fa-dice-d20"></i>${saveType} Saving Throw`;
  return a;
}

async function onRollSaveClick(event) {
  const actors = getCharacterOrTokens();
  actors.forEach(async (actor) => {
    await actor.rollSave({label: event.target.dataset.saveType}, actor);
  });
}

function skillRollEnricher(match, options) {
  const stats = capitalizeFirstLetter(match[1].toLowerCase());

  const a = document.createElement("a");
  a.classList.add("inline-skill-roll");
  a.dataset.statsType = stats;
  a.innerHTML = `<i class="fas fa-dice-d20"></i>${stats} Skill Check`;
  return a;
}

async function onRollSkillClick(event) {
  const actors = getCharacterOrTokens();
  actors.forEach(async (actor) => {
    if (typeof actor.rollSkillCheck === 'function') {
      await actor.rollSkillCheck({label: event.target.dataset.statsType}, actor);
    } else {
      ui.notifications.warn(`${actor.parent.name} doesn't have S.T.A.T.S.`);
    }
  });
}

function spellRollEnricher(match, options) {
  const a = document.createElement("a");
  a.classList.add("inline-spell-roll");
  a.innerHTML = `<i class="fas fa-dice-d20"></i>Spell Check`;
  return a;
}

async function onRollSpellClick(event) {
  const actors = getCharacterOrTokens();
  actors.forEach(async (actor) => {
    await actor.rollSpellCheck({}, actor);
  });
}

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function getCharacterOrTokens(warn = true) {
  const actors = game.user.character || canvas.tokens.controlled.map(t => t.actor.system);
  if (warn && !actors) {
    ui.notifications.warn("No character or token selected!");
  }
  return actors;
}