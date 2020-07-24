/*
    A test harness that accepts a range of options, and which spits out the merged options once it has been created.
*/
"use strict";
var fluid = require("infusion");
fluid.require("%fluid-launcher");

fluid.defaults("fluid.tests.launcher.harness", {
    gradeNames: ["fluid.launcher"],
    optionsFile: "%fluid-launcher/tests/data/workerDefaults.json",
    yargsOptions: {
        describe: {
            "var1":       "An option, set from somewhere.",
            "parsed":     "Model Transformation Rules that should be used to update any matching records.",
            "outputFile": "Where to save our output."
        },
        required: "outputFile",
        coerce: {
            "parsed": JSON.parse
        }
    }
});
