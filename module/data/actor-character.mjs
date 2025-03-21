import NeonLordsActorBase from "./base-actor.mjs";

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
      value: new fields.NumberField({ ...requiredInteger, initial: 1 })
    });

    schema.xp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(abilities_list.reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    schema.class = new fields.StringField({ required: true, nullable: false, trim: true, blank: true });
    schema.cp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      label: new fields.StringField({ required: true, nullable: false, trim: true, initial: "Class Points" })
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
}