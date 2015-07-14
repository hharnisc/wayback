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
    // NOTE: it's important to keep the parent
    // around for recalculating ids
    expect(model[id2].parent).to.equal(id);
    expect(model[id2].child).to.equal(id3);

    let item2 = wayback.pop();
    expect(wayback.length()).to.equal(1);
    expect(item2[id2].data).to.eql(data2);
    expect(wayback.head()).to.equal(id3);
    expect(wayback.tail()).to.equal(id3);
    // NOTE: it's important to keep the parent
    // around for recalculating ids
    expect(model[id3].parent).to.equal(id2);
    expect(model[id3].child).to.equal(null);

    let item3 = wayback.pop();
    expect(wayback.length()).to.equal(0);
    expect(item3[id3].data).to.eql(data3);
    expect(wayback.head()).to.equal(null);
    expect(wayback.tail()).to.equal(null);
    expect(model).to.eql({});

    expect(wayback.pop()).to.equal(null);
  });

  it("does insert at parent", () => {
    let model = wayback.model();
    let data = {message: "sup"};
    let id = wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    let data3 = {message: "oh hey again"};
    let id3 = wayback.push(data3);

    let data4 = {message: "just wanted to say hi one more time"};
    let id4 = wayback.push(data4);


    // insert data as id2 child
    let insertData = {message: "so I forgot something"};
    let insertId = wayback.insert(id2, insertData);

    let expectedOrder = [
      {id: id, data: data},
      {id: id2, data: data2},
      {id: insertId, data: insertData},
      {id: id3, data: data3},
      {id: id4, data: data4},
    ];

    let curModelId = wayback.tail();
    let curIdx = 0;
    let expectedHead;

    while (curModelId) {
      let curModel = model[curModelId];

      expect(curModel.data).to.equal(expectedOrder[curIdx].data);
      expect(curModelId).to.equal(expectedOrder[curIdx].id);

      // make sure the parent is linked
      if (curModel.parent) {
        let parentModel = model[curModel.parent];
        expect(parentModel.child).to.equal(curModelId);
      }

      // make sure child is linked
      if (curModel.child) {
        let childModel = model[curModel.child];
        expect(childModel.parent).to.equal(curModelId);
      }

      curIdx += 1;
      if (curIdx === expectedOrder.length) {
        expectedHead = curModelId;
      }
      curModelId = curModel.child;
    }
    expect(curIdx).to.equal(expectedOrder.length);
    expect(expectedHead).to.equal(wayback.head());
    expect(wayback.length()).to.equal(5);
  });

  it("does insert at head", () =>{
    let model = wayback.model();
    let data = {message: "sup"};
    let id = wayback.push(data);

    let insertData = "hello!";
    let insertId = wayback.insert(id, insertData);

    expect(wayback.head()).to.equal(insertId);

    let modelKeys = Object.keys(model);
    expect(modelKeys.length).to.equal(2);
    expect(model[insertId].data).to.equal(insertData);

  });

  it("does return null when missing parent", () => {
    let insertData = "hello!";
    let insertId = wayback.insert("youdontknowme", insertData);
    expect(insertId).to.equal(null);
  });

  it("does check for revision", () => {
     expect(wayback.hasRevision("youdontknowme")).to.equal(false);

     let data = {message: "sup"};
     let id = wayback.push(data);

     expect(wayback.hasRevision(id)).to.equal(true);
  });

  it("does handle max revision length pushes", () => {
    // create a wayback that can hold up to 2 revisions
    var shortWayback = new Wayback(2);
    var model = shortWayback.model();
    let data = "a short message";
    let id = shortWayback.push(data);
    expect(shortWayback.length()).to.equal(1);
    expect(shortWayback.head()).to.equal(id);
    expect(shortWayback.tail()).to.equal(id);

    let id2 = shortWayback.push(data);
    expect(shortWayback.length()).to.equal(2);
    expect(shortWayback.head()).to.equal(id2);
    expect(shortWayback.tail()).to.equal(id);

    let id3 = shortWayback.push(data);
    expect(shortWayback.length()).to.equal(2);
    expect(shortWayback.head()).to.equal(id3);
    expect(shortWayback.tail()).to.equal(id2);

    // NOTE: it's important to keep the parent
    // around for recalculating ids
    expect(model[id2].parent).to.equal(id);
  });

  it("does handle max revision length inserts", () => {
    // create a wayback that can hold up to 2 revisions
    var shortWayback = new Wayback(2);
    var model = shortWayback.model();
    let data = "a short message";
    let id = shortWayback.push(data);
    expect(shortWayback.length()).to.equal(1);
    expect(shortWayback.head()).to.equal(id);
    expect(shortWayback.tail()).to.equal(id);

    let id2 = shortWayback.push(data);
    expect(shortWayback.length()).to.equal(2);
    expect(shortWayback.head()).to.equal(id2);
    expect(shortWayback.tail()).to.equal(id);

    let data2 = "another short message";
    let insertId = shortWayback.insert(id, data2);

    expect(shortWayback.length()).to.equal(2);
    expect(shortWayback.head()).to.equal(id2);
    expect(shortWayback.tail()).to.equal(insertId);

    // NOTE: it's important to keep the parent
    // around for recalculating ids
    expect(model[insertId].parent).to.equal(id);
  });

  it("does return data at a given revision", () => {
    expect(wayback.getRevision("youdontknowme")).to.equal(null);

    let data = {message: "sup"};
    let id = wayback.push(data);

    expect(wayback.getRevision(id)).to.eql({
      data: data,
      child: null,
      parent: null
    });
  });

  it("does return a sequence of data after a revision", () => {
    expect(wayback.getSequence("youdontknowme")).to.equal(null);

    let data = {message: "sup"};
    let id = wayback.push(data);

    expect(wayback.getSequence(id)).to.eql([]);

    let data2 = {message: "sup2"};
    let id2 = wayback.push(data2);

    expect(wayback.getSequence(id)).to.eql([data2]);

    let data3 = {message: "sup3"};
    wayback.push(data3);

    expect(wayback.getSequence(id2)).to.eql([data3]);
    expect(wayback.getSequence(id)).to.eql([data2, data3]);
  });

  it("does export model", () => {
    wayback.push({message: "sup"});
    let exportedModel = wayback.exportModel();
    expect(exportedModel.length).to.equal(wayback.length());
    expect(exportedModel.model).to.eql(wayback.model());
    expect(exportedModel.head).to.equal(wayback.head());
    expect(exportedModel.tail).to.equal(wayback.tail());
  });

  it("does import model", () => {
    wayback.importModel({
      model: {
        ello: {
          data: {message: "sup"}, parent: null, child: null
        }
      },
      length: 1,
      head: "ello",
      tail: "ello"
    });

    expect(wayback.length()).to.equal(1);
    expect(wayback.head()).to.equal("ello");
    expect(wayback.tail()).to.equal("ello");
    expect(wayback.model()).to.eql({
      ello: {
        data: {message: "sup"}, parent: null, child: null
      }
    });
  });
});
