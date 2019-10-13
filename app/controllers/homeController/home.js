"use strict";

const fs = require("fs");
const http = require("request");
const os = require("os");
const extract = require("extract-zip");
const { exec } = require("child_process");
const { dialog } = require("electron").remote;
const { closeApp } = require("../../../src/common");
const { desktopCapturer } = require("electron");
const WebCamera = require("webcamjs");
const ioHook = require("iohook");

let enabled = false;

const resetSession = () => {
  return {
    keyup: 0,
    mouseclick: 0,
    screenshot: "",
    webcam: ""
  };
};

let sessionEvents = resetSession();

function processBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer.from(matches[2], "base64");

  return response;
}

angular
  .module("app.home", [])

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("home", {
      templateUrl: "app/controllers/homeController/home.html",
      url: "/home",
      controller: "homeCtrl",
      data: {
        authLevel: "common"
      }
    });
  })

  .controller("homeCtrl", function($http, $scope, $state, $window) {
    ioHook.on("keyup", event => {
      console.log("keyup", event);
      sessionEvents.keyup++;
    });
    ioHook.on("mouseclick", event => {
      console.log("mouseclick", event);
      sessionEvents.mouseclick++;
    });
    ioHook.start();

    $scope.toggleCamera = async flag => {
      if (!enabled && flag === true) {
        if (!$("#camdemo").length) {
          $("body").append(
            ` <div id="camdemo" style="width: 1280px; height: 720px; text-align: center; margin: 0 auto;" ></div>`
          );
        }
        enabled = true;
        let x = WebCamera.attach("#camdemo");
        console.log(x);
        $("#camdemo").css("display", "none");
        console.log("Please enable the camera first to take the snapshot !");
        await new Promise(resolve => setTimeout(() => resolve(), 1000));
      } else if (flag === false) {
        enabled = false;
        WebCamera.reset();
      }
      return enabled;
    };
    $scope.screenshot = async () => {
      await $scope.toggleCamera(true);
      let sources = await desktopCapturer.getSources({
        types: ["window", "screen"],
        thumbnailSize: {
          width: 1280,
          height: 720
        }
      });
      let ssPath = os.homedir() + "/Documents/screenshot.png";
      let wcPath = os.homedir() + "/Documents/webcam.png";
      sessionEvents.screenshot = await new Promise(resolve => {
        for (let e of sources) {
          if (
            e.name.toLowerCase() === "entire screen" ||
            e.name.toLowerCase() === "screen 1"
          ) {
            fs.writeFileSync(ssPath, e.thumbnail.toPNG());
            resolve(ssPath);
            break;
          }
        }
        resolve(null);
      });
      if (enabled) {
        sessionEvents.webcam = await new Promise(async resolve => {
          WebCamera.snap(async function(data_uri) {
            var imageBuffer = processBase64Image(data_uri);
            fs.writeFileSync(wcPath, imageBuffer.data);
            // await $scope.toggleCamera(false);
            resolve(wcPath);
          });
        });
      }
      console.log("Session", sessionEvents);
      sessionEvents = resetSession();
    };
  });
