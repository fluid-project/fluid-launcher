# gpii-launcher

This package provides a `gpii.launcher` [Fluid component](http://docs.fluidproject.org/infusion/development/UnderstandingInfusionComponents.html)
that standardizes the launching of Fluid components with custom options.  The component is based on [yargs](http://yargs.js.org/) and [Kettle](https://github.com/fluid-project/kettle).

# `gpii.launcher`

The launcher component uses yargs to generate a set of merged options that reflect (in order of precedence):

1. Any options passed on the command line.
2. The value of environment variables.
3. Options configured using the `optionsFile` parameter (see below).
4. The defaults configured using `options.yargsOptions` (see below).

A component will be launched with the merged options.

## Component Options

| Option          | Type       | Description |
| --------------- | ---------- | ----------- |
| `excludeKeys`   | `{Array}`  | The keys to exclude from the final merged options.  Defaults to `["optionsFile"]`, which strips the built-in `optionsFile` paramter (see below) from the output.|
| `includeKeys`   | `{Array}`  | The keys to include in the final merged options.  Defaults to `Object.keys(that.options.yargsOptions.describe)`, so that all of the properties yargs is aware of are passed through to the merged options. |
| `yargsOptions`  | `{Object}` | A map of yargs function names ([see their docs](http://yargs.js.org/docs/)) and arguments to pass to the function.  See below for examples. |

## The `optionsFile` parameter

The launcher supports an implicit `optionsFile` parameter, which allows you to load one or more options from a JSON
file.  You are expected to supply a single path, which must either be a path relative to the working directory, a full
filesystem path, or a package-relative path that can be parsed by
[`fluid.module.resolvePath`](http://docs.fluidproject.org/infusion/development/NodeAPI.html#fluid-module-resolvepath-path-)
(_%package/path/to/file.json_, for example).  You can set this using either an environment variable or a command-line
parameter.

The contents of this file will be loaded using the [configuration loading built into kettle](https://github.com/fluid-project/kettle/blob/master/docs/ConfigsAndApplications.md).  The file
is expected to correspond roughly to a component definition, but supports additional options for including other configuration files.  See [the kettle documentation](https://github.com/fluid-project/kettle/blob/master/docs/ConfigsAndApplications.md#structure-of-a-kettle-config
) for more details.


# Example Usage

To use the launcher, you need to define and launch a gpii.launcher instance, as in the example included with this package.



```
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
```

The defaults are configured to load a sample configuration file:

```
{
  "type": "launcherConfig",
  "options": {
    "gradeNames": ["my.launcher.worker"],
    "var1": "set in the options file."
  }
}
```

Here are some examples of using various combinations of command-line parameters and environment variables on a UNIX-like system:

```
$ node examples/my-launcher.js
Var 1: Set in the options file.

$ node examples/my-launcher.js --var1 "Set from the command line."
Var 1: Set from the command line.

$ var1="Set by an environment variable." node examples/my-launcher.js
Var 1: Set by an environment variable

$ node examples/my-launcher.js --optionsFile "%gpii-launcher/examples/my-alternate-launcher-config.json"
Var 1: Set in the alternate options file.

```