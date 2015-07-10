
import * as hat from "hat";

const model = Symbol("model");
const rack = Symbol("rack");

export class Wayback {
  constructor() {
    this[model] = {};
    this[rack] = hat.rack();
  }

  model() {
    return this[model];
  }

  push(data) {
    let id = this[rack]();
    this[model][id] = data;
    return id;
  }
}
