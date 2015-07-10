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
    expect(model[id].data).to.equal(data);
  });

  it("does report correct length", () => {
    let data = {message: "sup"};
    wayback.push(data);
    expect(wayback.length()).to.equal(1);
    wayback.push(data);
    expect(wayback.length()).to.equal(2);
  });

  it("does report correct head and tail id", () => {
    let data = {message: "sup"};
    let id = wayback.push(data);
    expect(wayback.head()).to.equal(id);
    expect(wayback.tail()).to.equal(id);

    let id2 = wayback.push(data);
    expect(wayback.head()).to.equal(id2);
    expect(wayback.tail()).to.equal(id);
  });

  it("does report correct parent", () => {
    let data = {message: "sup"};
    let model = wayback.model();
    let id = wayback.push(data);

    expect(model[id].parent).to.equal(null);

    let id2 = wayback.push(data);
    expect(model[id2].parent).to.equal(id);
  });

  it("does report correct child", () => {
    let data = {message: "sup"};
    let model = wayback.model();
    let id = wayback.push(data);
    expect(model[id].child).to.equal(null);

    let id2 = wayback.push(data);
    expect(model[id].child).to.equal(id2);
  });

  it("does pop from model", () => {
    let model = wayback.model();
    let data = {message: "sup"};
    let id = wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    let data3 = {message: "oh hey again"};
    let id3 = wayback.push(data3);

    let item = wayback.pop();
    expect(wayback.length()).to.equal(2);
    expect(item[id].data).to.eql(data);

    expect(wayback.head()).to.equal(id3);
    expect(wayback.tail()).to.equal(id2);
    expect(model[id2].parent).to.equal(null);
    expect(model[id2].child).to.equal(id3);

    let item2 = wayback.pop();
    expect(wayback.length()).to.equal(1);
    expect(item2[id2].data).to.eql(data2);
    expect(wayback.head()).to.equal(id3);
    expect(wayback.tail()).to.equal(id3);
    expect(model[id3].parent).to.equal(null);
    expect(model[id3].child).to.equal(null);

    let item3 = wayback.pop();
    expect(wayback.length()).to.equal(0);
    expect(item3[id3].data).to.eql(data3);
    expect(wayback.head()).to.equal(null);
    expect(wayback.tail()).to.equal(null);
    expect(model).to.eql({});

    expect(wayback.pop()).to.equal(null);
  });

});
