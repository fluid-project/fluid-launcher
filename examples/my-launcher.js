/* eslint-env node */
"use strict";
var fluid = require("infusion");
var my = fluid.registerNamespace("my");
fluid.require("%gpii-launcher");

fluid.defaults("my.launcher.worker", {
    gradeNames: ["fluid.component"],
    var1:    "set in the component",
    listeners: {
        "onCreate.log": {
            funcName: "console.log",
            args: ["Var 1:", "{that}.options.var1"]
        }
    }
});

fluid.registerNamespace("my.launcher");

my.launcher.launchWorker = function (that, passedOptions) {
    fluid.construct(that.options.componentPath, { type: "fluid.component", components: { innerComponent: { type: "my.launcher.worker", options: passedOptions }} });
};

fluid.defaults("my.launcher", {
    gradeNames: ["gpii.launcher"],
    componentPath: "my_dynamic_component",
    yargsOptions: {
        describe: {
            "var1": "you can set this option"
        }
    },
    listeners: {
        "onOptionsMerged.launchWorker": {
            funcName: "my.launcher.launchWorker",
            args:     ["{that}", "{arguments}.0"]
        }
    }
});

my.launcher();
