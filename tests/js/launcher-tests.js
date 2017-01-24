// Tests that launch the launcher with various options, while collecting istanbul code coverage reporting.
"use strict";
var fluid             = require("infusion");
var gpii              = fluid.registerNamespace("gpii");
var path              = require("path");
var jqUnit            = require("node-jqunit");
var os                = require("os");
var child_process     = require("child_process");
var istanbulPath      = fluid.module.resolvePath("%gpii-launcher/node_modules/istanbul/lib/cli.js");
var launcherPath      = fluid.module.resolvePath("%gpii-launcher/tests/js/lib/harness-launcher.js");
var coverageOutputDir = fluid.module.resolvePath("%gpii-launcher/coverage");
var optionsFile       = fluid.module.resolvePath("%gpii-launcher/tests/data/workerCustomOptions.json");

fluid.registerNamespace("gpii.tests.launcher");

gpii.tests.launcher.runSingleTest = function (that, testDef) {
    jqUnit.test(testDef.message, function () {
        jqUnit.stop();
        var outputFile = path.resolve(os.tmpdir(), that.id + "-" + Date.now() + "-" + Math.round(Math.random() * 1000) + ".json");
        var customLauncherPath = testDef.launcherPath ? fluid.module.resolvePath(testDef.launcherPath) : undefined;
        var commandOptions = { istanbulPath: istanbulPath, coverageOutputDir: coverageOutputDir, launcherPath: customLauncherPath || launcherPath, args: testDef.args || "", outputFile: outputFile};

        // Run the command with the specified arguments and environment variables.  Generate a coverage report for this run, which we will collate later.
        var command = fluid.stringTemplate("node %istanbulPath cover --print none --report none --include-pid --dir %coverageOutputDir %launcherPath -- %args --outputFile %outputFile", commandOptions);

        var execOptions = {
            cwd: fluid.module.resolvePath("%gpii-launcher"),
            env: testDef.env || {}
        };

        child_process.exec(command, execOptions, function (error) {
            jqUnit.start();
            if (error) {
                jqUnit.fail(testDef.message + " (error check):" + error);
            }
            else {
                jqUnit.assertLeftHand(testDef.message + " (output check)", testDef.expected, require(outputFile));
            }
        });
    });
};

fluid.defaults("gpii.tests.launcher.testRunner", {
    gradeNames: ["fluid.component"],
    testDefs: [
        {
            message: "A command line parameter should be passed as expected...",
            args: "--var1 command-line",
            expected: { var1: "command-line" }
        },
        {
            message: "An environment variable should be passed as expected...",
            env: { var1: "environment variable"},
            expected: { var1: "environment variable" }
        },
        {
            message: "Options should be loaded correctly from an options file (full path)...",
            args: "--optionsFile " + optionsFile,
            expected: { "var1": "Set from a custom options file." }
        },
        {
            message: "Options should be loaded correctly from an options file (relative path)...",
            args: "--optionsFile tests/data/workerCustomOptions.json",
            expected: { "var1": "Set from a custom options file." }
        },
        {
            message: "Options should be loaded correctly from an options file (package-relative path)...",
            args: "--optionsFile %gpii-launcher/tests/data/workerCustomOptions.json",
            expected: { "var1": "Set from a custom options file." }
        },
        {
            message: "Arbitrary options not referenced in the yargs config should be settable from an options file...",
            args: "--optionsFile %gpii-launcher/tests/data/workerCustomOptions.json",
            expected: {
                "additionalOption": true
            }
        },
        {
            message: "Options should be loaded correctly from an options file (environment variable)...",
            env: { optionsFile: "%gpii-launcher/tests/data/workerCustomOptions.json"},
            expected: { "var1": "Set from a custom options file." }
        },
        {
            message: "A command line parameter should take precedence over an environment variable...",
            args: "--var1 command-line",
            env: { var1: "environment variable"},
            expected: { var1: "command-line" }
        },
        {
            message: "An environment variable should take precedence over an options file variable...",
            args: "--optionsFile " + optionsFile,
            env: { var1: "environment variable"},
            expected: { var1: "environment variable" }
        },
        {
            message: "A command line parameter should take precedence over an options file variable...",
            args: "--var1 command-line --optionsFile " + optionsFile,
            env: { var1: "environment variable"},
            expected: { var1: "command-line" }
        },
        {
            message: "We should be able to pull specific environment variables and arguments into our config...",
            args: "--optionsFile %gpii-launcher/tests/data/pullWorker.json --var1 command-line",
            env: { var1: "environnment variable"},
            expected: {
                var1:    "command-line",
                envVar1: "environnment variable"
            }
        },
        {
            message: "A launcher with filterKeys set to false should allow all environment variables and arguments...",
            launcherPath: "%gpii-launcher/tests/js/lib/unfettered-harness-launcher.js",
            env: { env1: "arbitrary environment variable"},
            args: "--arg1 \"arbitrary argument\"",
            expected: {
                env1: "arbitrary environment variable",
                arg1: "arbitrary argument"
            }
        },
        {
            message: "Launching a file with no command line parameters or environment variables should also be safe...",
            expected: { "var1": "set in the component" }
        }
    ],
    invokers: {
        runSingleTest: {
            funcName: "gpii.tests.launcher.runSingleTest",
            args:     ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        "onCreate.runTests": {
            funcName: "fluid.each",
            args:     ["{that}.options.testDefs", "{that}.runSingleTest"]
        }
    }
});

gpii.tests.launcher.testRunner();
