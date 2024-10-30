import NeonLordsActorBase from "./base-actor.mjs";

const alignments_list = [
  "Chaotic",
  "Neutral",
  "Lawful"
]

export default class NeonLordsNPC extends NeonLordsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.alignment = new fields.StringField({ required: true, nullable: false, blank: true, choices: alignments_list });
    schema.hd = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.xp = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    
    return schema
  }

  prepareDerivedData() {
    this.xp = this.hd * 10;
  }
}