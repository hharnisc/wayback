
import * as hat from "hat";

const model = Symbol("model");
const rack = Symbol("rack");
const length = Symbol("length");

export class Wayback {
  constructor() {
    this[model] = {};
    this[length] = 0;
    this[rack] = hat.rack();
  }

  model() {
    return this[model];
  }

  push(data) {
    let id = this[rack]();
    this[model][id] = data;
    this[length] += 1;
    return id;
  }

  length() {
    return this[length];
  }
}
