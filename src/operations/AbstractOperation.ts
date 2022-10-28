export abstract class AbstractOperation {
  public toJSON() {
    return {
      ...this,
      constructor: {
        ...this.constructor,
        name: this.constructor.name
      }
    };
  }
}
