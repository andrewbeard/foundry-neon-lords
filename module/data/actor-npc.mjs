import NeonLordsActorBase from "./base-actor.mjs";

export default class NeonLordsNPC extends NeonLordsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.hd = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.xp = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    
    return schema
  }

  prepareDerivedData() {
    this.xp = this.hd * 10;
  }

  #totalBummer() {
    const rollTable = this.getTable("Creeps Total Bummer!");
    rollTable.then(table => table.draw());
  }

  firearmTotalBummer() {
    this.#totalBummer();
  }

  meleeTotalBummer() {
    this.#totalBummer();
  }

  spellcastingTotalBummer() {
    this.#totalBummer();
  }

  #toTheMax() {
    // FIXME: Implement this
  }

  firearmToTheMax() {
    this.#toTheMax();
  }

  meleeToTheMax() {
    this.#toTheMax();
  }

  spellcastingToTheMax() {
    this.#toTheMax();
  }
}