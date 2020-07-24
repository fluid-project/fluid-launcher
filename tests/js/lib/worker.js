/*

    A test grade that saves its effective options to a file for external inspection.

 */
"use strict";
var fluid = require("infusion");
var fs    = require("fs");

fluid.require("%fluid-launcher");

fluid.registerNamespace("fluid.tests.launcher.worker");

fluid.tests.launcher.worker.saveToFile = function (options) {
    var stringifiedJSON = JSON.stringify(options, null, 2);
    fluid.log(stringifiedJSON);
    try {
        fs.writeFileSync(options.outputFile, stringifiedJSON, "utf8");
        fluid.log("Component created with combined options:", stringifiedJSON);
    }
    catch (error) {
        fluid.fail("Error saving output:\n" + error.stack);
    }
};

fluid.defaults("fluid.tests.launcher.worker", {
    gradeNames: ["fluid.component"],
    var1: "set in the component",
    listeners: {
        "onCreate.saveToFile": {
            funcName: "fluid.tests.launcher.worker.saveToFile",
            args: ["{that}.options"]
        },
        "onCreate.destroy": {
            func: "{that}.destroy",
            priority: "after:saveToFile"
        }
    }
});
