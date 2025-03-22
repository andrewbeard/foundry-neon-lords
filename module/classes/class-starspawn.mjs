import NeonLordsClassBase from "./base-class.mjs";

export default class NeonLordsStarSpawnClass extends NeonLordsClassBase {
  get name() {
    return "Star Spawn";
  }

  get classPointName() {
    return "Psychic";
  }

  get classPointsTable() {
    return this.name + " - Class Points";
  }

  get gearSlots() {
    return 4;
  }

  get meleeToTheMaxTable() {
    return "Caster Class Melee - To the MAX!";
  }

  get meleeToTheMaxDie() {
    return "d8";
  }

  get spellcastingAbility() {
    return "brains";
  }

  get spellcastingBummerTable() {
    return "Hacking Total Bummer!";
  }

  get spellcastingToTheMaxTable() {
    return this.name + " - To the MAX!";  
  }
}