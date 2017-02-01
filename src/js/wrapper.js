#! /usr/bin/env node
/*

    A "wrapper" that launches the base gpii.launcher grade with the supplied optionsFile.  On UNIX-like systems, this
    wrapper is available as `gpii-launcher` in the effective path once you install this package.

*/
"use strict";
var fluid = require("infusion");

var gpii  = fluid.registerNamespace("gpii");

require("./launcher");

fluid.defaults("gpii.launcher.wrapper", {
    gradeNames: ["gpii.launcher"],
    filterKeys: false, // Allow arbitrary options by default.
    yargsOptions: {
        env: false // Disable environment parsing for the generic launcher.
    }
});

gpii.launcher.wrapper();
