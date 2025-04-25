import NeonLordsClassBase from "./base-class.mjs";
import NeonLordsBrutacornClass from "./class-brutacorn.mjs";
import NeonLordsCosmicBarbarianClass from "./class-cosmicbarbarian.mjs";
import NeonLordsCyberskinClass from "./class-cyberskin.mjs";
import NeonLordsDeathBringerClass from "./class-deathbringer.mjs";
import NeonLordsDwarflingClass from "./class-dwarfling.mjs";
import NeonLordsHEATHERClass from "./class-heather.mjs";
import NeonLordsHolySmiterClass from "./class-holysmiter.mjs";
import NeonLordsNightStalkerClass from "./class-nightstalker.mjs";
import NeonLordsNoiseThrasherClass from "./class-noisethrasher.mjs";
import NeonLordsSewerSharkClass from "./class-sewershark.mjs";
import NeonLordsSkullJammerClass from "./class-skulljammer.mjs";
import NeonLordsStarSpawnClass from "./class-starspawn.mjs";
import NeonLordsWarWizardClass from "./class-warwizard.mjs";


export default class NeonLordsClassFactory {
  static getClass(className) {
    className = className.replace('/l/g', '')
    switch (className) {
      case "Brutacorn":
        return new NeonLordsBrutacornClass();
      case "Cosmic Barbarian":
        return new NeonLordsCosmicBarbarianClass();
      case "Cyberskin":
        return new NeonLordsCyberskinClass();
      case "Death Bringer":
        return new NeonLordsDeathBringerClass();
      case "Dwarfling":
        return new NeonLordsDwarflingClass();
      case "HEATHER":
        return new NeonLordsHEATHERClass();
      case "Holy Smiter":
        return new NeonLordsHolySmiterClass();
      case "Night Stalker":
        return new NeonLordsNightStalkerClass();
      case "Noise Thrasher":
        return new NeonLordsNoiseThrasherClass();
      case "Sewer Shark":
        return new NeonLordsSewerSharkClass();
      case "Skull Jammer":
        return new NeonLordsSkullJammerClass();
      case "Star Spawn":
        return new NeonLordsStarSpawnClass();
      case "War Wizard":
        return new NeonLordsWarWizardClass();
    }
    return new NeonLordsClassBase();
  }
}
