# gpii-launcher

This package provides a `gpii.launcher` [Fluid component](http://docs.fluidproject.org/infusion/development/UnderstandingInfusionComponents.html)
that standardizes the launching of Fluid components with custom options.  The component is based on [yargs](http://yargs.js.org/) and [Kettle](https://github.com/fluid-project/kettle).

# `gpii.launcher`

The launcher component uses [yargs](http://yargs.js.org/) to generate a set of merged options that reflect (in order of precedence):

1. Any options passed on the command line.
2. The value of environment variables.
3. Options configured using the `optionsFile` parameter (see below).
4. The defaults configured using `options.yargsOptions` (see below).

It's possible to bypass this order, see the section "Pulling Environment Variables by Reference" below for more details.
Once the options have been constructed, a component will be launched with the merged options.

## Component Options

| Option          | Type        | Description |
| --------------- | ----------- | ----------- |
| `filterKeys`    | `{Boolean}` | Whether or not to filter the list of options.  If set to `true`, only known options configured using `yargsOptions` will be used.  If set to `false`, any arbitrary options will be passed.  Set to `true` by default. |
| `excludeKeys`   | `{Array}`   | The keys to exclude from the final merged options.  Defaults to `["optionsFile"]`, which strips the built-in `optionsFile` parameter (see below) from the output.|
| `includeKeys`   | `{Array}`   | The keys to include in the final merged options.  Defaults to `Object.keys(that.options.yargsOptions.describe)`, so that all of the properties yargs is aware of are passed through to the merged options. |
| `yargsOptions`  | `{Object}`  | A map of yargs function names and arguments to pass to the function.  See below for more details, and for the defaults. |

## The `yargsOptions` option

To give you an example of how `yargsOptions` can be used, here are the defaults provided by the base `gpii.launcher`
grade:

```
yargsOptions: {
    env: true, // Parse environment variables
    demandOption: "optionsFile", // Which arguments are required.
    describe: {
        "optionsFile": "A file to load configuration options from."
    },
    help: true, // Provide a `--help` option that displays our usage information.
    usage: "Usage $0 [options]" // Display a "usage" message if args are missing or incorrect.
},
```

This provides support for a single required variable, `optionsFile`, which can be provided either as a command line
argument or environment variable (`env: true`).

For full documentation on all available functions and arguments, see [the yargs documentation](http://yargs.js.org/docs/).


## The `optionsFile` parameter and configuration file format

The launcher supports an implicit `optionsFile` parameter, which allows you to load one or more options from a JSON
file.  You are expected to supply a single path, which must either be a path relative to the working directory, a full
filesystem path, or a package-relative path that can be parsed by
[`fluid.module.resolvePath`](http://docs.fluidproject.org/infusion/development/NodeAPI.html#fluid-module-resolvepath-path-)
(for example, `%package/path/to/file.json`).  You can set the `optionsFile` option using an environment variable, a
command line parameter, or by specifying it in the defaults, as in:

```
fluid.defaults("my.launcher", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        defaults: {
            optionsFile: "%my-package/configs/config.json"
        }
    }
});
```

The contents of this file will be loaded using the [configuration loading built into kettle](https://github.com/fluid-project/kettle/blob/master/docs/ConfigsAndApplications.md).
The file is expected to correspond roughly to a component definition, but supports additional options for including
other configuration files.

In general, the config file format is a superset of a normal [subcomponent definition](http://docs.fluidproject.org/infusion/development/SubcomponentDeclaration.html).
As with subcomponents,  you are expected to enclose the component options in an `options` keyword.  Although a
subcomponent definition requires a `type` field, in the case of a configuration file `type` is optional, but should be 
filled in with a unique name (for example, the name of the configuration file minus the extension).  The `type` will
be a part of the constructed grade name, and will appear in log messages, so a unique name helps make it clear which
options are being used for a given launch.  If `type` is omitted, it will be replace with a generated ID, which makes
troubleshooting more difficult.

See [the kettle documentation](https://github.com/fluid-project/kettle/blob/master/docs/ConfigsAndApplications.md#structure-of-a-kettle-config
) for more details about the configuration file format, including the special keywords that support merging material
from other configuration files.


# Using the global launcher

This package includes a generic launcher that can be used to load any options file (see above) directly.  When using
this package as a dependency, this script is available under `node_modules/.bin/gpii-launcher`.  You can also install
this package globally, in which case the `gpii-launcher` command will be available in your path.

The generic launcher supports the two core options provided by the base `gpii.launcher` grade, namely the `optionsFile`
parameter (see above) and a `logLevel` parameter that you can use to toggle logging.  The generic launcher allows you to
set any arbitrary option (see the `filterKeys` option above).  However, it only accepts command-line arguments (see the
`yargsOptions.env` example above).


# Creating a custom launcher

If you wish to make use of the wider range of yargs features supported by this package, you need to define and launch a
`gpii.launcher` instance, as in the example included with this package.


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

Note that we have defined a component grade `my.launcher.worker`, which is visible from our launch file.  We could also
have defined a grade in an external file, but we must require that file from the launcher file itself, so that it is
defined when we try to instantiate the component.

In this example, we set a default for `optionsFile`, which is used to load a sample configuration file:

```
{
    "type": "launcherConfig",
    "options": {
        "gradeNames": ["my.launcher.worker"],
        "var1": "set in the options file."
    }
}
```

Note the `gradeNames` parameter refers to the `my.launcher.worker` grade we defined in the same file where we defined
our launcher grade itself.  The `gradeNames` keyword in a configuration file is the the primary way in which we
associate our launcher with the component grade(s) to be launched.

As with sub-components, we can have multiple `gradeNames`, which will be merged as they would when instantiating a
sub-component.  [Grades are merged from left to right](http://docs.fluidproject.org/infusion/development/ComponentGrades.html#combining-grades),
so that that rightmost grade's options take precedence.

So, assuming the above launcher and configuration file, here are some examples of the output that results when using 
various combinations of command line parameters and environment variables:

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

# Referencing Deep Variables

By default, yargs supports [using "dot notation" to refer to deep variables](http://yargs.js.org/docs/#parsing-tricks-dot-notation).
To allow someone to set arbitrary deep paths, set `filterKeys` (see above) to false in your launcher options.  To
"describe" or "demand" a deep variable, you would use `yargsOptions` like the following:

```
yargsOptions: {
    describe: {
        "deep.path": "A deep path, which is required."
    },
    demandOption: "deep.path"
}
```
You can then pass in an option using a command like `node my-launcher.js --deep.path /tmp`

The resulting options would contain a `path` string within a `deep` object, as in:

```
{
    deep: {
        path: "/tmp"
    }
}
```

# IoC Reference Resolution

All IoC references are resolved when the component is instantiated, and you can pass IoC options from a command line
argument or environment variable.  For example, launch the supplied example script in this package using a command
like the following:

```
node examples/my-launcher.js --optionsFile %gpii-launcher/examples/my-launcher-config.json --var2 "{that}.options.var1"
```

In the resulting output, you will see that `var2` is drawn from `options.var1`, which in this case is a value loaded
from a configuration file.


# Pulling Environment Variables by Reference

The previous examples covered "pushing" options information through from arguments or environment variables.  It is
also possible to explicitly "pull" environment variables and arguments from an options block, as shown in this
sample configuration file:

```
{
  "type": "pullConfig",
  "options": {
    "gradeNames": ["my.grade"],
    "myvar": "{gpii.launcher.resolver}.env.myvar"
  }
}
```

This mechanism allows you to bypass the default order of inheritance, to prefer an environment variable over a
command line argument.  Let's say you run a command like the following on a UNIX-like system:

`myvar=environment node my-launcher.js --optionsFile %my-package/configs/pullConfig.json --myvar command-line`

Instead of the default behavior, which would result in `myvar` being set to `command-line`, with the settings shown
above, the value of `myvar` would be `environment` instead.

# Functions that Support Arrays

Many functions provided by yargs support a single argument.  For convenience, most values used as part of the
`yargsOptions` block (strings, objects, numbers, booleans, functions) are wrapped in an array and treated as the first
argument to the underlying function.  This allows you to use simple values wherever possible, as in:

```javascript
fluid.defaults("gpii.launcher.simpleVars", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        // This object is passed to the underlying "describe" method.
        describe: {
            foo: "The first field.",
            bar: "The second."
        },
        // This boolean is passed to the underlying "env" method.
        env: false,
        // This number is passed to the underlying "wrap" method.
        wrap: 80
    }
});
```

However, as a byproduct of this, you must use a different syntax to directly pass an array to a yargs function, as shown
in the following example:

```javascript
fluid.defaults("gpii.launcher.arrayVars", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        "array": [["arrayVar1", "arrayVar2"]],
        "demandOption": [["outputFile", "arrayVar1"]],
        "boolean": [["bool1", "bool2"]],
        "number": [["num1", "num2"]]
    }
});
```

The same options can be expressed using [the `options` method provided by yargs](http://yargs.js.org/docs/#api-optionskey-opt),
as shown in the following example:

```javascript
fluid.defaults("gpii.launcher.optionsObject", {
    gradeNames: ["gpii.launcher"],
    yargsOptions: {
        options: {
            "arrayVar1": {
                "array": true,
                "demandOption": true
            },
            "arrayVar2": {
                "type": "array"
            },
            "bool1": {
                "boolean": true
            },
            "bool2": {
                "type": "boolean"
            },
            "num1": {
                "number": true
            },
            "num2": {
                "type": "number"
            },
            "outputFile": {
                "demandOption": true                
            }
        }
    }
});
```

You can choose the format which best fits your needs.