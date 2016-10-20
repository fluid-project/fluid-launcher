/* eslint-env node */
"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");

var path = require("path");

require("../../");

var jqUnit = require("node-jqunit");

jqUnit.module("Testing static functions within the launcher...");

jqUnit.test("Test key filtering...", function () {
    jqUnit.assertDeepEq("Including keys should work as expected...", { a: "b"}, gpii.launcher.filterKeys(["a"], false, { a: "b", c: "d"}));

    jqUnit.assertDeepEq("Excluding keys should work as expected...", { a: "b"}, gpii.launcher.filterKeys(false, ["c"], { a: "b", c: "d"}));

    jqUnit.assertDeepEq("The original results should be passed through if filters are disabled...", { a: "b", c: "d"}, gpii.launcher.filterKeys(false, false, { a: "b", c: "d"}));

    jqUnit.assertDeepEq("Includes and excludes should work in combination...", { a: "b"}, gpii.launcher.filterKeys(["a", "c"], ["c"], { a: "b", c: "d", e: "f"}));

});

jqUnit.test("Test file loading...", function () {
    var expected = require("../data/optionsFile.json");

    jqUnit.assertDeepEq("We should be able to load file content using a full path...", expected, gpii.launcher.loadFileOptions(path.resolve(__dirname, "../data/optionsFile.json")));

    jqUnit.assertDeepEq("We should be able to load file content using a package-relative path...", expected, gpii.launcher.loadFileOptions("%gpii-launcher/tests/data/optionsFile.json"));
});
