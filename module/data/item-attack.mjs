import NeonLordsItemBase from "./base-item.mjs";

export default class NeonLordsAttack extends NeonLordsItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.bonus = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 });
    schema.damage_roll = new fields.StringField({ required: true, nullable: false, blank: true, trim: true });
    schema.damage_type = new fields.StringField({ required: true, nullable: false, blank: true, trim: true });
    schema.special = new fields.StringField({ required: true, nullable: false, blank: true, trim: true });

    return schema;
  }
}