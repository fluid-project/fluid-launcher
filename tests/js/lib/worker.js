/*

    A test grade that saves its effective options to a file for external inspection.

 */
"use strict";
var fluid = require("infusion");

var gpii  = fluid.registerNamespace("gpii");
var fs    = require("fs");

fluid.require("%gpii-launcher");

fluid.registerNamespace("gpii.tests.launcher.worker");

gpii.tests.launcher.worker.saveToFile = function (options) {
    var stringifiedJSON = JSON.stringify(options, null, 2);
    console.log(stringifiedJSON);
    fs.writeFileSync(options.outputFile, stringifiedJSON, "utf8");
    console.log("Component created with combined options:", stringifiedJSON);
};

fluid.defaults("gpii.tests.launcher.worker", {
    gradeNames: ["fluid.component"],
    var1: "set in the component",
    listeners: {
        "onCreate.saveToFile": {
            funcName: "gpii.tests.launcher.worker.saveToFile",
            args: ["{that}.options"]
        },
        "onCreate.destroy": {
            func: "{that}.destroy",
            priority: "after:saveToFile"
        }
    }
});
