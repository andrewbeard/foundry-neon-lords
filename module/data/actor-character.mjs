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

const saves_list = [
  "grit",
  "agility",
  "resolve",
  "death"
]

export default class NeonLordsCharacter extends NeonLordsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(abilities_list.reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    schema.saves = new fields.SchemaField(saves_list.reduce((obj, save) => {
      obj[save] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  #calculateMod(abilityScore) {
    // Yes, this is the dumb way of calculating. Fix this later when my brain is fully engaged
    let mod = -3;
    if (abilityScore >= 18) {
      mod = 3;
    } else if (abilityScore >= 16) {
      mod = 2;
    } else if (abilityScore >= 13) {
      mod = 1;
    } else if (abilityScore >= 9) {
      mod = 0;
    } else if (abilityScore >= 6) {
      mod = -1;
    } else if (abilityScore >= 4) {
      mod = -2;
    }
    return mod;
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

    data.lvl = this.attributes.level.value;

    return data
  }
}