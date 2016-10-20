/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

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

/**
 *
 * Load a JSON options file from `filePath`.
 *
 * @param filePath {String} - A full, cwd-relative, or package-relative path to an options file.
 * @returns {Object} - The object represented by the JSON file.
 *
 */
gpii.launcher.loadFileOptions = function (filePath) {
    var fullPath = gpii.launcher.resolvePath(filePath);
    return require(fullPath);
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

