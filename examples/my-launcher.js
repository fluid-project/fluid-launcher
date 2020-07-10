/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var my = fluid.registerNamespace("my");
fluid.require("%fluid-launcher");

fluid.defaults("my.launcher.worker", {
    gradeNames: ["fluid.component"],
    var1:    "set in the component",
    listeners: {
        "onCreate.log": {
            funcName: "fluid.log",
            args: ["Options:", "@expand:JSON.stringify({that}.options, null, 2)"]
        },
        "onCreate.destroy": {
            func: "{that}.destroy",
            priority: "after:log"
        }
    }
});

fluid.registerNamespace("my.launcher");

fluid.defaults("my.launcher", {
    gradeNames: ["fluid.launcher"],
    filterKeys: false,
    yargsOptions: {
        describe: {
            "var1": "you can set this option"
        },
        defaults: {
            "optionsFile": "%fluid-launcher/examples/my-launcher-config.json"
        }
    }
});

my.launcher();
