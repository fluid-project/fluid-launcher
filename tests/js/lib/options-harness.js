"use strict";
var fluid = require("infusion");

require("./harness");

fluid.defaults("fluid.tests.launcher.optionsHarness", {
    gradeNames: ["fluid.tests.launcher.harness"],
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

fluid.tests.launcher.optionsHarness();
