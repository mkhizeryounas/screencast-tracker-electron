const { getApp } = require("electron").remote.require("./main.js");

module.exports.closeApp = () => getApp().exit(0);
