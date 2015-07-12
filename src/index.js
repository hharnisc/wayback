"use strict";

import sha1 from "sha-1";

const model = Symbol("model");
const modelLength = Symbol("length");
const head = Symbol("head");
const tail = Symbol("tail");
const createNode = Symbol("createNode");
const maxRevisions = Symbol("maxRevisions");

export class Wayback {
  constructor(maximumRevisions=null) {
    this[model] = {};
    this[modelLength] = 0;
    this[head] = null;
    this[tail] = null;
    this[maxRevisions] = maximumRevisions;
  }

  model() {
    return this[model];
  }

  exportModel() {
    return {
      model: this[model],
      length: this[modelLength],
      head: this[head],
      tail: this[tail]
    };
  }

  importModel(newModel) {
    // TODO: sanitize input
    // TODO: handle when maximumRevisions is set
    this[model] = newModel.model;
    this[modelLength] = newModel.length;
    this[tail] = newModel.tail;
    this[head] = newModel.head;
  }

  hasRevision(revision) {
    return revision in this[model];
  }

  getRevision(revision) {
    if (this.hasRevision(revision)) {
      return this[model][revision];
    } else {
      return null;
    }
  }

  getSequence(revision) {
    if (this.hasRevision(revision)) {
      let sequence = [];
      let curRevision = this[model][revision].child;
      while (curRevision) {
        let curModel = this[model][curRevision];
        sequence.push(curModel.data);
        curRevision = curModel.child;
      }
      return sequence;
    } else {
      return null;
    }
  }

  push(data) {
    // create a new node
    let id = this[createNode](this[head], data);

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
    this[modelLength] += 1;
    if (this[maxRevisions] && this[modelLength] > this[maxRevisions]) {
      this.pop();
    }

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
    if (this[modelLength] > 1) {
      this[tail] = modelItem.child;
      // this[model][modelItem.child].parent = null;
    } else {
      // otherwise clear the head and tail revisions
      this[tail] = null;
      this[head] = null;
    }

    // decrement the number if items
    this[modelLength] -= 1;
    return item;
  }

  insert(parent, data) {
    // unknown parent
    if (!this.hasRevision(parent)) {
      return null;
    }
    // just do a push op when inserting to head
    if (parent === this[head]) {
      return this.push(data);
    }
    let parentModel = this[model][parent];
    let oldChild = parentModel.child;

    // create a new node with links:
    // parent <- newNode -> child
    let insertId = this[createNode](parent, data, parentModel.child);

    // parent -> newNode
    parentModel.child = insertId;


    let curNodeId = oldChild;
    let prevInsertId = insertId;
    while (curNodeId) {
      let curNode = this[model][curNodeId];

      // insert the new node
      let newInsertId = this[createNode](
        prevInsertId,
        curNode.data,
        curNode.child
      );

      // update the parent with the new child id
      this[model][prevInsertId].child = newInsertId;
      prevInsertId = newInsertId;

      // remove the old node
      delete this[model][curNodeId];

      // update the head ref
      if (curNode.child === null) {
        this[head] = newInsertId;
      }

      // increment node
      curNodeId = curNode.child;
    }

    return insertId;
  }

  [createNode](parent, data, child=null) {
    let id = sha1(JSON.stringify({
      parent: parent,
      data: data
    }));

    // create a new node
    this[model][id] = {
      data: data,
      parent: parent,
      child: child
    };
    return id;
  }

  length() {
    return this[modelLength];
  }

  head() {
    return this[head];
  }

  tail() {
    return this[tail];
  }
}
