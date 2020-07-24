"use strict";
var fluid  = require("infusion");

require("../../");

var jqUnit = require("node-jqunit");

jqUnit.module("Testing static functions within the launcher...");

jqUnit.test("Test key filtering...", function () {
    jqUnit.assertDeepEq("Including keys should work as expected...", { a: "b"}, fluid.launcher.filterKeys(["a"], false, { a: "b", c: "d"}));

    jqUnit.assertDeepEq("Excluding keys should work as expected...", { a: "b"}, fluid.launcher.filterKeys(false, ["c"], { a: "b", c: "d"}));

    jqUnit.assertDeepEq("The original results should be passed through if filters are disabled...", { a: "b", c: "d"}, fluid.launcher.filterKeys(false, false, { a: "b", c: "d"}));

    jqUnit.assertDeepEq("Includes and excludes should work in combination...", { a: "b"}, fluid.launcher.filterKeys(["a", "c"], ["c"], { a: "b", c: "d", e: "f"}));

});
