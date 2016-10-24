/* eslint-env node */
"use strict";
var fluid = require("infusion");

require("./src/js/launcher");

fluid.module.register("gpii-launcher", __dirname, require);
