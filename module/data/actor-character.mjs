import NeonLordsActorBase from "./base-actor.mjs";
import NeonLordsClassFactory from "../classes/class-factory.mjs";

const abilities_list = [
  "burliness",
  "prowess",
  "endurance",
  "brains",
  "attitude",
  "sleaze",
  "fortune"
]

export default class NeonLordsCharacter extends NeonLordsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.level = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
    });

    schema.xp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(abilities_list.reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    schema.castAbility = new fields.StringField({ required: true, nullable: false, trim: true, initial: "brains" })
    schema.className = new fields.StringField({ required: true, nullable: false, trim: true, blank: true });
    schema.cp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10, min:0 }),
    });
    return schema;
  }

  #calculateMod(abilityScore) {
    const modThresholds = [
      [18, 3],
      [16, 2], 
      [13, 1],
      [9, 0],
      [6, -1],
      [4, -2]
    ];
    
    for (const [threshold, value] of modThresholds) {
      if (abilityScore >= threshold) {
        return value;
      }
    }
    return -3;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      this.abilities[key].mod = this.#calculateMod(this.abilities[key].value);
    }
    this.class = NeonLordsClassFactory.getClass(this.className);
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.level.value;

    return data
  }

  firearmTotalBummer() {
    const rollTable = this.getTable("Firearms Total Bummer!");
    rollTable.then(table => table.draw());
  }

  meleeTotalBummer() {
    const rollTable = this.getTable("Total Bummer!");
    rollTable.then(table => table.draw());
  }

  spellcastingTotalBummer() {
    const rollTable = this.getTable(this.class.spellcastingTotalBummerTable);
    rollTable.then(table => table.draw());
  }

  firearmToTheMax() {
    if (!this.class.firearmToTheMaxTable) {
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      const rollMode = game.settings.get('core', 'rollMode');
  
      // If there's no roll data, send a chat message.
      if (!this.system.formula) {
        ChatMessage.create({
          speaker: speaker,
          rollMode: rollMode,
          content: "Head shot, double damage!"
        });
        return;
      }
    }
    const rollTable = this.getTable(this.class.firearmToTheMaxTable);
    rollTable.then(table => table.draw());
  }

  meleeToTheMax() {
    const rollTable = this.getTable(this.class.meleeToTheMaxTable);
    const roll = new Roll(this.class.meleeToTheMaxDie, this.getRollData());
    rollTable.then(table => table.draw({roll}));
  }

  spellcastingToTheMax() {
    if (!this.class.spellcastingToTheMaxTable) {
      return;
    }
    const rollTable = this.getTable(this.class.spellcastingToTheMaxTable);
    rollTable.then(table => table.draw());
  }
}