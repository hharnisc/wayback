"use strict";

import { expect } from "chai";
import sha1 from "sha-1";
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
    wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    let data3 = {message: "oh hey again"};
    wayback.push(data3);

    let data4 = {message: "just wanted to say hi one more time"};
    wayback.push(data4);


    // insert data as id2 child
    let insertData = {message: "so I forgot something"};
    wayback.insert(id2, insertData);

    let expectedDataOrder = [data, data2, insertData, data3, data4];


    let curModelId = wayback.tail();
    let curIdx = 0;
    let expectedHead;

    while (curModelId) {
      let curModel = model[curModelId];

      expect(curModel.data).to.equal(expectedDataOrder[curIdx]);

      // make sure the id is correct
      let calcId = sha1(JSON.stringify({
        parent: curModel.parent,
        data: curModel.data
      }));
      expect(calcId).to.equal(curModelId);

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
      if (curIdx === expectedDataOrder.length) {
        expectedHead = curModelId;
      }
      curModelId = curModel.child;
    }
    expect(curIdx).to.equal(expectedDataOrder.length);
    expect(expectedHead).to.equal(wayback.head());
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

  it("does handle max revision length", () => {
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
    expect(exportedModel).to.eql({
      model: {
        b074a570a0cd00c34b9eff1d825229b6607bdd3e: {
          data: {message: "sup"}, parent: null, child: null
        }
      },
      length: 1,
      head: "b074a570a0cd00c34b9eff1d825229b6607bdd3e",
      tail: "b074a570a0cd00c34b9eff1d825229b6607bdd3e",
      pseudonyms: {}
    });
  });

  it("does import model", () => {
    wayback.importModel({
      model: {
        b074a570a0cd00c34b9eff1d825229b6607bdd3e: {
          data: {message: "sup"}, parent: null, child: null
        }
      },
      length: 1,
      head: "b074a570a0cd00c34b9eff1d825229b6607bdd3e",
      tail: "b074a570a0cd00c34b9eff1d825229b6607bdd3e",
      pseudonyms: {}
    });

    expect(wayback.length()).to.equal(1);
    expect(wayback.head()).to.equal("b074a570a0cd00c34b9eff1d825229b6607bdd3e");
    expect(wayback.tail()).to.equal("b074a570a0cd00c34b9eff1d825229b6607bdd3e");
    expect(wayback.model()).to.eql({
      b074a570a0cd00c34b9eff1d825229b6607bdd3e: {
        data: {message: "sup"}, parent: null, child: null
      }
    });
  });

  it("does get origin name from pseudonym", () => {
    let data = {message: "sup"};
    let id = wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    // insert data after id
    // this makes id2 change
    let insertData = {message: "so I forgot something"};
    let insertId = wayback.insert(id, insertData);

    // console.log(wayback.model());

    expect(wayback.getOrigin(id2))
      .to.equal("f9897c6c8d74c3ce94e613ba78eedc9db1230912");

    // insert data after insertId
    // this makes id2 change again
    let insertData2 = {message: "so I forgot another thing"};
    wayback.insert(insertId, insertData2);

    expect(wayback.getOrigin(id2))
      .to.equal("068cabaebb9b09c06b7300d38056b089e7ed7bb0");
  });

  it("does keep pseudonyms on insert", () => {
    let data = {message: "sup"};
    let id = wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    // insert data after id
    // this makes id2 change
    let insertData = {message: "so I forgot something"};
    wayback.insert(id, insertData);

    // insert data with the old id2,
    // which should still work as a pseudonym
    let insertData2 = {message: "very forgetful"};
    expect(wayback.insert(id2, insertData2))
      .to.equal("65cb25d527d0873d41a79d2ad80fa67f328c348a");
  });

  it("does keep second order pseudonyms on insert", () => {
    let data = {message: "sup"};
    let id = wayback.push(data);

    let data2 = {message: "sup again"};
    let id2 = wayback.push(data2);

    // insert data after id
    // this makes id2 change
    let insertData = {message: "so I forgot something"};
    let insertId = wayback.insert(id, insertData);

    // insert data after insertId
    // this makes id2 change again
    let insertData2 = {message: "so I forgot another thing"};
    wayback.insert(insertId, insertData2);

    // insert data with the old id2,
    // which should still work as a pseudonym
    let insertData3 = {message: "very forgetful"};
    expect(wayback.insert(id2, insertData3))
      .to.equal("75333751797a4cd6f8aa870f184d25cb8f1672a5");
  });
});
