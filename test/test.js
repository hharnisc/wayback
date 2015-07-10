/*global describe*/
/*global beforeEach*/
/*global it*/

"use strict";

import { expect } from "chai";
import { Wayback } from "../src/index";


describe("wayback tests", () => {
  let wayback;

  beforeEach(() => {
    wayback = new Wayback();
  });

  it("does create empty wayback", () => {
    expect(wayback.model()).to.eql({});
  });

  it("does push new data onto wayback", () => {
    // push new data onto wayback
    let data = {message: "sup"};
    let id = wayback.push(data);

    // make sure there is one revision
    let model = wayback.model();
    let modelKeys = Object.keys(model);
    expect(modelKeys.length).to.equal(1);
    expect(model[id]).to.equal(data);
  });

  it("does report correct length", () => {
    let data = {message: "sup"};
    wayback.push(data);
    expect(wayback.length()).to.equal(1);
    wayback.push(data);
    expect(wayback.length()).to.equal(2);
  });

  it("does report correct parent id", () => {
    let data = {message: "sup"};
    let id = wayback.push(data);
    expect(wayback.head()).to.equal(id);
    expect(wayback.tail()).to.equal(id);

    let id2 = wayback.push(data);
    expect(wayback.head()).to.equal(id2);
    expect(wayback.tail()).to.equal(id);
  });

});
