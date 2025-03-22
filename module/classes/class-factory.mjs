import NeonLordsClassBase from "./base-class.mjs";
import NeonLordsBrutacornClass from "./class-brutacorn.mjs";
import NeonLordsCosmicBarbarianClass from "./class-cosmicbarbarian.mjs";

export default class NeonLordsClassFactory {
  static getClass(className) {
    switch (className) {
      case "Brutacorn":
        return new NeonLordsBrutacornClass();
      case "Cosmic Barbarian":
        return new NeonLordsCosmicBarbarianClass();
    }
    return new NeonLordsClassBase();
  }
}
