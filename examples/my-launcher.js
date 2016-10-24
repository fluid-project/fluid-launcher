/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var my = fluid.registerNamespace("my");
fluid.require("%gpii-launcher");

fluid.defaults("my.launcher.worker", {
    gradeNames: ["fluid.component"],
    var1:    "set in the component",
    listeners: {
        "onCreate.log": {
            funcName: "fluid.log",
            args: ["Var 1:", "{that}.options.var1"]
        },
        "onCreate.destroy": {
            func: "{that}.destroy",
            priority: "after:log"
        }
    }
});

fluid.registerNamespace("my.launcher");

fluid.defaults("my.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        describe: {
            "var1": "you can set this option"
        },
        defaults: {
            "optionsFile": "%gpii-launcher/examples/my-launcher-config.json"
        }
    }
});

my.launcher();
