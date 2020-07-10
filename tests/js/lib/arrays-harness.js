"use strict";
var fluid = require("infusion");

require("./harness");

fluid.defaults("fluid.tests.launcher.arrays", {
    gradeNames: ["fluid.tests.launcher.harness"],
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
            "optionsFile": "%fluid-launcher/tests/data/arrays.json"
        }
    }
});

fluid.tests.launcher.arrays();
