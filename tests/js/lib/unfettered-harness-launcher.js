// A launcher that does not filter by the yargs options, and which hence allows arbitrary command line options.  Used in
// the "unfettered" tests.
"use strict";
var fluid = require("infusion");

require("./harness");

fluid.defaults("fluid.tests.launcher.unfetteredHarness", {
    gradeNames: ["fluid.tests.launcher.harness"],
    filterKeys: false
});

fluid.tests.launcher.unfetteredHarness();
