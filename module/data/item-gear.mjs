import NeonLordsItemBase from "./base-item.mjs";

export default class NeonLordsGear extends NeonLordsItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0, max: 2 });
    schema.value = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });


    return schema;
  }
}