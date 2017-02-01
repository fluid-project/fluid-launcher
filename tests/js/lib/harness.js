/*
    A test harness that accepts a range of options, and which spits out the merged options once it has been created.
*/
"use strict";
var fluid = require("infusion");
fluid.require("%gpii-launcher");

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
