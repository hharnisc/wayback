
const model = Symbol("model");

export class Wayback {
  constructor() {
    this[model] = {};
  }

  model() {
    return this[model];
  }
}
