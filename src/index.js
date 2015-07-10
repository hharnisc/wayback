"use strict";

import sha1 from "sha-1";

const model = Symbol("model");
const length = Symbol("length");
const head = Symbol("head");
const tail = Symbol("tail");

export class Wayback {
  constructor() {
    this[model] = {};
    this[length] = 0;
    this[head] = null;
    this[tail] = null;
  }

  model() {
    return this[model];
  }

  push(data) {
    // generate an id with sha1
    //  of parent and data
    let id = sha1(JSON.stringify({
      parent: this[head],
      data: data
    }));

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

  pop() {
    // if empty return null
    if (!this[tail]) {
      return null;
    }

    // get the current tail item
    let modelItem = this[model][this[tail]];
    let item = {};
    item[this[tail]] = modelItem;

    delete this[model][this[tail]];
    // if there are 2 or more revisions update the child
    if (this[length] > 1) {
      this[tail] = modelItem.child;
      this[model][modelItem.child].parent = null;
    } else {
      // otherwise clear the head and tail revisions
      this[tail] = null;
      this[head] = null;
    }

    // decrement the number if items
    this[length] -= 1;
    return item;
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
