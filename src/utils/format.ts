export class FSFormat {
  
  /**
   * Converts a script character name to a natural name.
   * Example: "BOB" -> "Bob"
   * All individual words are capitalized
   * when encountering a lowercase letter, capitalize the next letter
   * @param name The name to convert
   */
  static nameToNatural(name: string): string {
    let naturalName = "";
    let capitalizeNext = true;
    for (let i = 0; i < name.length; i++) {
      const c = name.charAt(i);
      if (c.match(/[a-z]/) !== null || c === " ") {
        capitalizeNext = true;
        naturalName += c;
      } else if (capitalizeNext) {
        naturalName += c.toUpperCase();
        capitalizeNext = false;
      } else {
        naturalName += c.toLowerCase();
      }
    }
    return naturalName;
  }
}