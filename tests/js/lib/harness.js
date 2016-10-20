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
    privateOption: true,
    listeners: {
        "onCreate.saveToFile": {
            funcName: "gpii.tests.launcher.worker.saveToFile",
            args: ["{that}.options"]
        }
    }
});

fluid.registerNamespace("gpii.tests.launcher.harness");
gpii.tests.launcher.harness.launchWorker = function (that, passedOptions) {
    fluid.construct(that.options.componentPath, { type: "fluid.component", components: { innerComponent: { type: "gpii.tests.launcher.worker", options: passedOptions }} });
};

fluid.defaults("gpii.tests.launcher.harness", {
    gradeNames: ["gpii.launcher"],
    componentPath: "launcher_worker",
    yargsOptions: {
        describe: {
            "var1":        "An option, set from somewhere.",
            "parsed":      "Model Transformation Rules that should be used to update any matching records.",
            "outputFile":  "Where to save our output."
        },
        required: ["outputFile"],
        coerce: {
            "parsed": JSON.parse
        }
    },
    listeners: {
        "onOptionsMerged.launchWorker": {
            funcName: "gpii.tests.launcher.harness.launchWorker",
            args:     ["{that}", "{arguments}.0"]
        }
    }
});

gpii.tests.launcher.harness();
