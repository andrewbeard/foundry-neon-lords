import NeonLordsItemBase from "./base-item.mjs";

export default class NeonLordsSpell extends NeonLordsItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellLevel = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1, max: 9 });
    schema.duration = new fields.StringField({ required: true, nullable: false, blank: true, trim: true});
    schema.range = new fields.StringField({ required: true, nullable: false, blank: true, trim: true});
    schema.spellCheck = new fields.BooleanField({ required: true, nullable: false, initial: false});

    return schema;
  }
}