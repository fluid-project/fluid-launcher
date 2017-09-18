"use strict";
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

require("./harness");

fluid.defaults("gpii.tests.launcher.arrays", {
    gradeNames: ["gpii.tests.launcher.harness"],
    "yargsOptions": {
        "array": [["arrayVar1", "arrayVar2"]],
        "demandOption": [["outputFile", "arrayVar1"]],
        "boolean": [["bool1", "bool2"]],
        "number": [["num1", "num2"]],
        "describe": {
            "arrayVar1": "The first array-capable field.",
            "arrayVar2": "The second array-capable field."
        },
        "defaults": {
            "optionsFile": "%gpii-launcher/tests/data/arrays.json"
        }
    }
});

gpii.tests.launcher.arrays();

