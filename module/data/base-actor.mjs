import NeonLordsDataModel from "./base-model.mjs";

const saves_list = [
  "grit",
  "agility",
  "resolve",
  "death"
]

const alignments_list = [
  "Khaotic",
  "Neutral",
  "Lawful"
]

export default class NeonLordsActorBase extends NeonLordsDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.hp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 })
    });
    schema.ac = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 9, min: 0 }),
    });
    schema.movement = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 30, min: 0 }),
    });
    schema.spellCheck = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 18, min: 1 }),
    });
    schema.saves = new fields.SchemaField(saves_list.reduce((obj, save) => {
      obj[save] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields
    schema.alignment = new fields.StringField({ required: true, nullable: false, blank: true, choices: alignments_list });


    return schema;
  }

  getTable(tableName) {
    if (!tableName) {
      console.error("Trying to find table with no name!");
      return;
    }
    const pack = game.packs.get("neon-lords.tables");
    if (!pack) {
      console.error("Pack table not found!");
      return;
    }
    pack.getIndex();
    const tableObj = pack.index.find(t => t.name === tableName);
    if (!tableObj) {
      console.error("Table " + tableName + " not found!");
      return;
    }
    return pack.getDocument(tableObj._id);
  }

  async rollSave(rollInfo, actor) {
    let rollMod = "";
    if (rollInfo?.modifier) {
      rollMod += ` +${rollInfo.modifier}`;
    }
    const roll = new Roll("d20" + rollMod);
    const result = await roll.evaluate();

    const saveName = rollInfo.label.toLowerCase();
    const targetNumber = this.saves[saveName]?.value;
    if (!targetNumber) {
      console.error(rollInfo.label + " Saving Throw not found!");
      return;
    }

    const resultText = result.total >= targetNumber 
      ? `<span style="color: #009900; font-weight: bold;">✓ Success!</span> (${result.total} ≥ ${targetNumber})`
      : `<span style="color: #990000; font-weight: bold;">✗ Failure!</span> (${result.total} < ${targetNumber})`;
    
    const enrichedResultText = await TextEditor.enrichHTML(resultText, {
      async: true,
      rollData: this.getRollData(),
      relativeTo: this,
    });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: `${rollInfo.label} Saving Throw<br>${enrichedResultText}`,
      rollMode: game.settings.get("core", "rollMode")
    });
  }

  get spellCheckMod() {
    return 0;
  }

  async rollSpellCheck(rollInfo, actor) {
    const spell = this.parent.items.get(rollInfo?.rollItemId);
    let success = false;
    let roll = null;
    let resultText = "";

    const flavor = spell ? `[Spell] ${spell.name}` : 'Spell Check';

    if (spell && !spell.system.spellCheck) {
      // No spell check, always succeed
      success = true;
    } else {
      let rollMod = "";
      if (this.spellCheckMod) {
          rollMod += ` +${this.spellCheckMod}`;
      }
      if (rollInfo?.modifier) {
        rollMod += ` +${rollInfo.modifier}`;
      }
      roll = new Roll("d20" + rollMod);
      const result = await roll.evaluate();
      const targetNumber = this.spellCheck.value;
      const isFumble = result.terms[0].results[0].result === 1;
      const isToTheMax = result.terms[0].results[0].result === 20;
      success = result.total >= targetNumber || isToTheMax;

      if (isFumble) {
        resultText += `<span style="color: #990000; font-weight: bold;">Fumble!</span> (${result.total})<br><br>`;
        resultText += await this.spellcastingTotalBummer();
      } else if (isToTheMax) {
        resultText += `<span style="color: #009900; font-weight: bold;">TO THE MAX!!</span> (${result.total})<br><br>`;
        resultText += await this.spellcastingToTheMax();
      } else if (success) {
        resultText += `<span style="color: #009900; font-weight: bold;">✓ Success!</span> (${result.total} ≥ ${targetNumber})`;
      } else {
        resultText += `<span style="color: #990000; font-weight: bold;">✗ Failure!</span> (${result.total} < ${targetNumber})`;
      }
    }

    if (success && spell) {
      resultText += '<p><b>Effect:</b></p>' + spell.system.description;
    }

    const enrichedResultText = await TextEditor.enrichHTML(resultText, {
      async: true,
      rollData: this.getRollData(),
      relativeTo: this,
    });

    if (roll) {
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        rollMode: game.settings.get("core", "rollMode"),
        flavor: flavor,
        content: enrichedResultText
      });
    } else {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        rollMode: game.settings.get("core", "rollMode"),
        flavor: flavor,
        content: enrichedResultText
      });
    }
    return success;
  }
}