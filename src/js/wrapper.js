#! /usr/bin/env node
/*

    A "wrapper" that launches the base fluid.launcher grade with the supplied optionsFile.  On UNIX-like systems, this
    wrapper is available as `fluid-launcher` in the effective path once you install this package.

*/
"use strict";
var fluid = require("infusion");

require("./launcher");

fluid.defaults("fluid.launcher.wrapper", {
    gradeNames: ["fluid.launcher"],
    filterKeys: false, // Allow arbitrary options by default.
    yargsOptions: {
        env: false // Disable environment parsing for the generic launcher.
    }
});

fluid.launcher.wrapper();
