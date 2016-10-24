/*
    A test harness that accepts a range of options, and which spits out the merged options once it has been created.
*/
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var gpii  = fluid.registerNamespace("gpii");
var fs    = require("fs");

require("../../../");

fluid.registerNamespace("gpii.tests.launcher.worker");

gpii.tests.launcher.worker.saveToFile = function (options) {
    var stringifiedJSON = JSON.stringify(options, null, 2);
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

fluid.defaults("gpii.tests.launcher.harness", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            "var1":       "An option, set from somewhere.",
            "parsed":     "Model Transformation Rules that should be used to update any matching records.",
            "outputFile": "Where to save our output."
        },
        defaults: {
            optionsFile: "%gpii-launcher/tests/data/workerDefaults.json"
        },
        required: ["outputFile"],
        coerce: {
            "parsed": JSON.parse
        }
    }
});

gpii.tests.launcher.harness();
