/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

var yargs = require("yargs");

fluid.registerNamespace("gpii.launcher");

gpii.launcher.mergeOptions = function (that) {
    fluid.each(that.options.yargsOptions, function (fnArgs, fnName) {
        yargs[fnName].apply(yargs, fluid.makeArray(fnArgs));
    });

    var args = yargs.argv;

    var options = that.filterKeys(args);

    if (args.optionsFile) {
        var optionsFileOptions = that.filterKeys(gpii.launcher.loadFileOptions(args.optionsFile));
        options = fluid.merge(null, optionsFileOptions, options);
    }

    that.events.onOptionsMerged.fire(options);
};

gpii.launcher.filterKeys = function (includeKeys, excludeKeys, objectToFilter) {
    var filteredResults = fluid.copy(objectToFilter);

    filteredResults = includeKeys ? fluid.filterKeys(filteredResults, includeKeys) : filteredResults;

    filteredResults = excludeKeys ? fluid.censorKeys(filteredResults, excludeKeys) : filteredResults;

    return filteredResults;
};

gpii.launcher.loadFileOptions = function (filePath) {
    return require(fluid.module.resolvePath(filePath));
};

fluid.defaults("gpii.launcher", {
    gradeNames: ["fluid.component"],
    includeKeys: "@expand:Object.keys({that}.options.yargsOptions.describe)",
    excludeKeys: ["optionsFile"],
    yargsOptions: {
        usage: "Usage $0 [options]",
        env: true,
        describe: {
            "optionsFile": "A file to load configuration options from."
        }
    },
    events: {
        onOptionsMerged: null
    },
    listeners: {
        "onCreate.run": {
            funcName: "gpii.launcher.mergeOptions",
            args:     ["{that}"]
        }
    },
    invokers: {
        filterKeys: {
            funcName: "gpii.launcher.filterKeys",
            args: ["{that}.options.includeKeys", "{that}.options.excludeKeys", "{arguments}.0"]
        }
    }
});

