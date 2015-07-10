
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
    // generate a random id
    let id = this[rack]();
    // create a new node
    this[model][id] = {
      data: data,
      parent: this[head],
      child: null
    };

    // set the new node as the child of the
    // parent if it exists
    if (this[head]) {
      this[model][this[head]].child = id;
    }

    // update the head and tail references
    this[head] = id;
    if (!this[tail]) {
      this[tail] = id;
    }

    // increment the model length
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
