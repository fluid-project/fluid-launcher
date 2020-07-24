/*
    A test harness that accepts a range of options, and which spits out the merged options once it has been created.
*/
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

require("./harness");

fluid.tests.launcher.harness();
