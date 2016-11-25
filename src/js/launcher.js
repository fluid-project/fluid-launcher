"use strict";
var fluid  = require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var kettle = fluid.registerNamespace("kettle");

fluid.require("%kettle/lib/KettleConfigLoader.js");

var yargs   = require("yargs");
var path    = require("path");
var process = require("process");

fluid.registerNamespace("gpii.launcher");

/**
 *
 * Merge options from (in order of precedence):
 *
 * 1. An options file, if supplied.
 * 2. Environment variables.
 * 3. Command line parameters.
 *
 * @param that - The `gpii.launcher` component itself.
 *
 */
gpii.launcher.launchComponent = function (that) {
    fluid.each(that.options.yargsOptions, function (fnArgs, fnName) {
        yargs[fnName].apply(yargs, fluid.makeArray(fnArgs));
    });

    var args = yargs.argv;

    var paramAndEnvironmentOptions = that.filterKeys(args);

    var fullPath   = gpii.launcher.resolvePath (args.optionsFile);
    var configPath = path.dirname(fullPath);
    var configName = path.basename(fullPath, ".json");
    var componentName = kettle.config.createDefaults({ configPath: configPath, configName: configName });

    return fluid.invokeGlobalFunction(componentName, [paramAndEnvironmentOptions]);
};

/**
 *
 * Filter an object by a list of keys to include and/or a list of keys to exclude.
 *
 * @param includeKeys {Array} - The list of keys to include.
 * @param excludeKeys {Array} - The list of keys to exclude.
 * @param objectToFilter {Object} - The original object to filter.
 * @returns {Object} The filtered object.
 *
 */
gpii.launcher.filterKeys = function (includeKeys, excludeKeys, objectToFilter) {
    var filteredResults = fluid.copy(objectToFilter);

    filteredResults = includeKeys ? fluid.filterKeys(filteredResults, includeKeys) : filteredResults;

    filteredResults = excludeKeys ? fluid.censorKeys(filteredResults, excludeKeys) : filteredResults;

    return filteredResults;
};

/**
 *
 * Resolve a full, cwd-relative, or package-relative path to a full path.
 *
 * @param pathToResolve {String} - The path to resolve.
 * @returns {String} - The resolved path
 *
 */
gpii.launcher.resolvePath = function (pathToResolve) {
    return path.resolve(process.cwd(), fluid.module.resolvePath(pathToResolve));
};

fluid.defaults("gpii.launcher", {
    gradeNames: ["fluid.component"],
    includeKeys: "@expand:Object.keys({that}.options.yargsOptions.describe)",
    excludeKeys: ["optionsFile"],
    yargsOptions: {
        usage: "Usage $0 [options]",
        env: true,
        demand: ["optionsFile"],
        describe: {
            "optionsFile": "A file to load configuration options from."
        }
    },
    listeners: {
        "onCreate.launchComponent": {
            funcName: "gpii.launcher.launchComponent",
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
