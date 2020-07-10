"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

require("./harness");

fluid.defaults("gpii.tests.launcher.optionsHarness", {
    gradeNames: ["gpii.tests.launcher.harness"],
    includeKeys: "@expand:Object.keys({that}.options.yargsOptions.options)",
    "yargsOptions": {
        "options": {
            "arrayVar1": {
                "array": true,
                "demandOption": true,
                "description": "An array of values."
            },
            "arrayVar2": {
                "type": "array"
            },
            "booleanVar1": {
                "boolean": true
            },
            "booleanVar2": {
                "type": "boolean"
            },
            "outputFile": {
                "description": "Where to save our output.",
                "demandOption": true
            }
        }
    }
});

gpii.tests.launcher.optionsHarness();

