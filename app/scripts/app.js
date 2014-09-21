"use strict";

//globals!
var music = false;
var settings = {
    gamespeed: 45,
    series: 12,
    cutoff: 800,
    q: 12,
    test: function(){
        if(!music){
            settings.music.start();
        } else {
            settings.music.stop();
        }
    }
};

function center(el) {
    $("html,body").animate({
        scrollTop: $(el).offset().top - (( $(window).height() - $(this).outerHeight(true) ) / 2),
        scrollLeft: $(el).offset().left - (( $(window).width() - $(this).outerWidth(true) ) / 2)
    }, 200);
};

var gameSpeed = 70;

// var gui = new dat.GUI({ autoPlace: false });
// var customContainer = document.getElementById('top-nav');
// customContainer.appendChild(gui.domElement);
//
//   gui.add(settings, 'gamespeed');
//   gui.add(settings, 'series');
//   gui.add(settings, 'cutoff', 100, 1000);
//   gui.add(settings, 'q', 0, 20);
//   gui.add(settings, 'test');


//music!
var pattern = new sc.Pshuf(sc.series(settings.series), Infinity);
var scale   = new sc.Scale.minor();
var chords  = [0, 1, 4];

var msec = timbre.timevalue("BPM120 L16");
var osc  = T("saw");
var env  = T("env", {table:[0.4, [1, msec * 48], [0.2, msec * 16]]});
var gen  = T("OscGen", {osc:osc, env:env, mul:0.2});

var pan   = T("pan", gen);
var synth = pan;

// synth = T("+saw", {freq:(msec * 2)+"ms", add:0.5, mul:0.85}, synth);
synth = T("lpf" , {cutoff:settings.cutoff, Q:settings.q}, synth);
// synth = T("reverb", {room:0.95, damp:0.1, mix:0.75}, synth);

settings.music = T("interval", {interval:msec * settings.gamespeed}, function() {
  var root = pattern.next();
  chords.forEach(function(i) {
    gen.noteOn(scale.wrapAt(root + i) +60, 80);
  });
  pan.pos.value = Math.random() * 2 - 1;
}).set({buddies:synth});




// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
        	console.log("using this one");
            window.setTimeout(callback, 1000 / 60);
        };
})();

angular.module("beastieApp", ["firebase", "ui.router"])
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/menu");

        $stateProvider
            .state("menu", {
                url: "/menu",
                templateUrl: "views/menu.html",
                controller: "MenuCtrl"
            })
            .state("help", {
                url: "/help",
                templateUrl: "views/instructions.html",
                controller: "InstructionsCtrl"
            })
            .state("highscore", {
                url: "/highscore",
                templateUrl: "views/highscore.html",
                controller: "HighscoreCtrl"
            })
            .state("game", {
                url: "/game",
                templateUrl: "views/game.html",
                controller: "GameCtrl"
            })
            .state("game.paused", {
                templateUrl: "views/game_paused.html"
            })
            .state("game.ended", {
                templateUrl: "views/game_ended.html"
            });
    }]);

angular.module("beastieApp").filter("toArray", function() {
    return function(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }
        return _.map(obj, function(val, key) {
            return Object.defineProperty(val, "$key", {__proto__: null, value: key});
        });
    };
});
