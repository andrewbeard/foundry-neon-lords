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
    this.effective_level = this.level.value;
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

  get critRange() {
    return this.class.critRange;
  }

  async firearmTotalBummer() {
    const rollTable = await this.getTable("Firearms Total Bummer!");
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }

  async meleeTotalBummer() {
    const rollTable = await this.getTable("Total Bummer!");
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }

  async spellcastingTotalBummer() {
    const rollTable = await this.getTable(this.class.spellcastingTotalBummerTable);
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }

  async firearmToTheMax() {
    if (!this.class.firearmToTheMaxTable) {
      // If there's firearm table just send a generic message
      return "Head shot, double damage!";
    }
    const rollTable = await this.getTable(this.class.firearmToTheMaxTable);
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }

  async meleeToTheMax() {
    const rollTable = await this.getTable(this.class.meleeToTheMaxTable);
    const roll = new Roll(this.class.meleeToTheMaxDie, this.getRollData());
    const result = await rollTable.draw({roll: roll, displayChat: false});
    return result.results[0].text;
  }

  async spellcastingToTheMax() {
    if (!this.class.spellcastingToTheMaxTable) {
      return;
    }
    const rollTable = await this.getTable(this.class.spellcastingToTheMaxTable);
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }
}