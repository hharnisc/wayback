
import * as hat from "hat";

const model = Symbol("model");
const rack = Symbol("rack");
const length = Symbol("length");
const head = Symbol("head");
const tail = Symbol("tail");

export class Wayback {
  constructor() {
    this[model] = {};
    this[length] = 0;
    this[head] = null;
    this[tail] = null;
    this[rack] = hat.rack();
  }

  model() {
    return this[model];
  }

  push(data) {
    let id = this[rack]();
    this[model][id] = data;
    this[head] = id;
    if (!this[tail]) {
      this[tail] = id;
    }
    this[length] += 1;
    return id;
  }

  length() {
    return this[length];
  }

  head() {
    return this[head];
  }

  tail() {
    return this[tail];
  }
}
