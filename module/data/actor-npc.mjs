import NeonLordsActorBase from "./base-actor.mjs";

export default class NeonLordsNPC extends NeonLordsActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.hd = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.xp = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.to_the_max_normal = new fields.StringField({ required: true, nullable: false, blank: true});
    schema.to_the_max_ouch = new fields.StringField({ required: true, nullable: false, blank: true});

    return schema;
  }

  prepareDerivedData() {
    this.effective_level = this.hd;
    this.xp = this.hd * 10;
  }

  getRollData() {
    const data = {};
    data.lvl = this.hd.value;

    return data
  }

  get critRange() {
    return 20;
  }

  async #totalBummer() {
    const rollTable = await this.getTable("Creeps Total Bummer!");
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].description;
  }

  async firearmTotalBummer() {
    return this.#totalBummer();
  }

  async meleeTotalBummer() {
    return this.#totalBummer();
  }

  async spellcastingTotalBummer() {
    const rollTable = await this.getTable("Spell Misfire");
    const result = await rollTable.draw({displayChat: false});
    return result.results[0].description;
  }

  async #toTheMax() {
    const roll = new Roll("d20");
    const result = await roll.evaluate();
    if (result.total >= this.critRange) {
      return this.to_the_max_ouch;
    } else {
      return this.to_the_max_normal;
    }
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