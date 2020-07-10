// A launcher that does not filter by the yargs options, and which hence allows arbitrary command line options.  Used in
// the "unfettered" tests.
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./harness");

fluid.defaults("gpii.tests.launcher.unfetteredHarness", {
    gradeNames: ["gpii.tests.launcher.harness"],
    filterKeys: false
});

gpii.tests.launcher.unfetteredHarness();
