# gpii-launcher

This package provides a `gpii.launcher` [Fluid component](http://docs.fluidproject.org/infusion/development/UnderstandingInfusionComponents.html)
that standardizes the launching of fluid components with custom options.  The component is based on [yargs](http://yargs.js.org/).

# `gpii.launcher`

The launcher component uses yargs to generate a set of merged options that reflect (in order of precedence):

1. Any options passed on the command line.
2. The value of environment variables.
3. Options configured using the `optionsFile` parameter (see below).
4. The defaults configured using `options.yargsOptions` (see below).

## Component Options

## The `optionsFile` parameter

The launcher supports an implicit `optionsFile` parameter, which allows you to load one or more options from a JSON
file.  You are expected to supply a single path, which must either be a full filesystem path, or a package-relative path
that can be parsed by [`fluid.module.resolvePath`](http://docs.fluidproject.org/infusion/development/NodeAPI.html#fluid-module-resolvepath-path-)
(_%package/path/to/file.json_, for example).  You can set this using either an environment variable or a command-line
parameter.

Note that as with command-line arguments and environment variables, the options supplied will be filtered using
`options.includeKeys` and `options.excludeKeys` (see above).

# Example Usage

For the launcher to be useful, at a minimum you will need to listen for the component's `onOptionsMerged` event, and
then do something with the options.  The example below creates a dynamic component based on the supplied options:

```
fluid.registerNamespace("my.launcher");

my.launcher.launch = function (that, pasedOptions) {
    var options = that.options.defaultComponentOptions;
    fluid.merge(null, options, passedOptions);
    fluid.construct(that.options.componentPath, options);
};

fluid.defaults("my.launcher", {
    gradeNames: ["gpii.launcher"],
    componentPath: "my_dynamic_component",
    mergePolicy: {
        defaultComponentOptions: "nomerge, noexpand"
    },
    defaultComponentOptions: {
        gradeNames: ["fluid.component"],
        listeners: {
            "onCreate.logOptions": {
                funcName: "fluid.log",
                args: ["My final options are:", "@expand:JSON.stringify({that}.options, null, 2)"]
            }
        }

    }
    events: {
        onOptionsMerged: null
    }
});
```