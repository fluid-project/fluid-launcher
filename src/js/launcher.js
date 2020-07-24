"use strict";
var fluid  = require("infusion");
var kettle = fluid.registerNamespace("kettle");

fluid.require("%kettle/lib/KettleConfigLoader.js");

var yargs   = require("yargs");
var path    = require("path");
var process = require("process");

// A global resolver that can be used to pull raw environment variables from configuration blocks.
fluid.defaults("fluid.launcher.resolver", {
    gradeNames: ["fluid.component", "fluid.resolveRootSingle"],
    singleRootType: "fluid.launcher.resolver",
    members: {
        env:  process.env
    }
});

// Create an instance of fluid.resolvers.env
fluid.construct("gpii_launcher_resolver", {
    type: "fluid.launcher.resolver"
});

fluid.registerNamespace("fluid.launcher");

/**
 *
 * Merge options from (in order of precedence):
 *
 * 1. An options file, if supplied.
 * 2. Environment variables.
 * 3. Command line parameters.
 *
 * @param {Object} that - The `fluid.launcher` component itself.
 * @return {Any} - The return value from the invoked function.
 *
 */
fluid.launcher.launchComponent = function (that) {
    fluid.each(that.options.yargsOptions, function (fnArgs, fnName) {
        yargs[fnName].apply(yargs, fluid.makeArray(fnArgs));
    });

    var args = fluid.copy(yargs.argv);
    yargs.reset();

    var paramAndEnvironmentOptions = that.options.filterKeys ? that.filterKeys(args) : args;

    var fullPath   = fluid.launcher.resolvePath(args.optionsFile);
    var configPath = path.dirname(fullPath);
    var configName = path.basename(fullPath, ".json");

    // TODO: guard against missing dependencies, which will otherwise result in the creation of empty components.
    // See: https://issues.fluidproject.org/browse/FLUID-6123
    var componentName = kettle.config.createDefaults({ configPath: configPath, configName: configName });
    return fluid.invokeGlobalFunction(componentName, [paramAndEnvironmentOptions]);
};

/**
 *
 * Filter an object by a list of keys to include and/or a list of keys to exclude.
 *
 * @param {Array} includeKeys - The list of keys to include.
 * @param {Array} excludeKeys - The list of keys to exclude.
 * @param {Object} objectToFilter - The original object to filter.
 * @return {Object} The filtered object.
 *
 */
fluid.launcher.filterKeys = function (includeKeys, excludeKeys, objectToFilter) {
    var filteredResults = fluid.copy(objectToFilter);

    filteredResults = includeKeys ? fluid.filterKeys(filteredResults, includeKeys) : filteredResults;

    filteredResults = excludeKeys ? fluid.censorKeys(filteredResults, excludeKeys) : filteredResults;

    return filteredResults;
};

/**
 *
 * Resolve a full, cwd-relative, or package-relative path to a full path.
 *
 * @param {String} pathToResolve - The path to resolve.
 * @return {String} - The resolved path
 *
 */
fluid.launcher.resolvePath = function (pathToResolve) {
    return path.resolve(process.cwd(), fluid.module.resolvePath(pathToResolve));
};

/**
 *
 * Generate a simple set of keys to use when filtering incoming arguments.
 *
 * @param {Object} yargsOptions - Configuration options to pass to yargs.
 * @return {Array} - An array of strings representing the allowed keys based on our `yargsOptions`.
 *
 */
fluid.launcher.generateIncludeKeys = function (yargsOptions) {
    var discoveredKeyMap = {};

    // Functions accepting arrays
    fluid.each(["array", "boolean", "demandOption", "number", "string"], function (propertyWithArrayOfKeys) {
        fluid.each(fluid.makeArray(yargsOptions[propertyWithArrayOfKeys]), function (key) {
            discoveredKeyMap[key] = true;
        });
    });

    // Functions accepting maps
    fluid.each(["choices", "coerce", "default", "describe", "options"], function (mapProperty) {
        if (yargsOptions[mapProperty]) {
            fluid.each(yargsOptions[mapProperty], function (_, key) {
                discoveredKeyMap[key] = true;
            });
        }
    });

    // Special handling for "alias", which can be called with `["original", "alias"]` or `{ original: "alias"}`.
    if (yargsOptions.alias) {
        if (Array.isArray(yargsOptions.alias)) {
            discoveredKeyMap[yargsOptions.alias[0]] = true;
        }
        else {
            fluid.each(yargsOptions.alias, function (_, key) {
                discoveredKeyMap[key] = true;
            });
        }
    }

    var keysToInclude = Object.keys(discoveredKeyMap);
    return keysToInclude;
};

fluid.defaults("fluid.launcher", {
    gradeNames:  ["fluid.component"],
    filterKeys:  true,
    logLevel:    fluid.logLevel.INFO,
    includeKeys: "@expand:fluid.launcher.generateIncludeKeys({that}.options.yargsOptions)",
    excludeKeys: ["optionsFile"],
    yargsOptions: {
        env: true, // Parse environment variables
        options: {
            optionsFile: {
                describe:     "A file to load configuration options from.",
                demandOption: true,
                default:      "{that}.options.optionsFile"
            },
            logLevel: {
                describe: "The Fluid log level to set before launch.",
                coerce:   "{that}.expand",
                choices:  [
                    "fluid.logLevel.FATAL",
                    "fluid.logLevel.FAIL",
                    "fluid.logLevel.WARN",
                    "fluid.logLevel.IMPORTANT",
                    "fluid.logLevel.INFO",
                    "fluid.logLevel.TRACE"
                ]
            }
        },
        help: true, // Provide a `--help` option that displays our usage information.
        usage: "Usage $0 [options]" // Display a "usage" message if args are missing or incorrect.
    },
    listeners: {
        "onCreate.setLogLevel": {
            priority: "first",
            funcName: "fluid.setLogLevel",
            args:     ["{that}.options.logLevel"]
        },
        "onCreate.launchComponent": {
            funcName: "fluid.launcher.launchComponent",
            args:     ["{that}"]
        }
    },
    invokers: {
        filterKeys: {
            funcName: "fluid.launcher.filterKeys",
            args: ["{that}.options.includeKeys", "{that}.options.excludeKeys", "{arguments}.0"]
        },
        expand: {
            funcName: "fluid.expand",
            args:     ["{arguments}.0", "{that}"]
        }
    }
});
