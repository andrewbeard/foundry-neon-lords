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

  async #totalBummer() {
    const rollTable = await this.getTable("Creeps Total Bummer!");
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].text;
  }

  async firearmTotalBummer() {
    return this.#totalBummer();
  }

  async meleeTotalBummer() {
    return this.#totalBummer();
  }

  async spellcastingTotalBummer() {
    return this.#totalBummer();
  }

  async #toTheMax() {
    // FIXME: Implement this
  }

  async firearmToTheMax() {
    return this.#toTheMax();
  }

  async meleeToTheMax() {
    return this.#toTheMax();
  }

  async spellcastingToTheMax() {
    return this.#toTheMax();
  }
}