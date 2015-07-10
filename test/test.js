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
});
