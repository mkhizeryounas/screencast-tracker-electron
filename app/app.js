"use strict";

// Declare app level module which depends on views, and components
var app = angular.module("app", ["ui.router", "app.home", "app.blank"]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise("/home");
});

app.controller("mainCtrl", function($window, $state) {
  $window.goto = route => $state.go(route);
});
