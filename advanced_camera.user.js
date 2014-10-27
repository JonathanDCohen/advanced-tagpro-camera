// ==UserScript==
// @name         TagPro Free-Moving Camera
// @namespace    http://reddit.com/user/Splanky222
// @version      1.0
// @description  Free-Moving Camera for TagPro
// @author       BBQchicken
// @include       http://tagpro-*.koalabeast.com*
// @include       http://tangent.jukejuice.com*
// @include		  http://maptest*.newcompte.fr:*
// @include       http://tagproandluckyspammersucksandunfortunatesniperisawesome.com*             
// ==/UserScript==

function FreeCamera() {	

	// ---------- HELPERS AND CONSTANTS ---------- \\

		var LEFT = 37, DOWN = 38, RIGHT = 39, UP = 40, OFFSET = 37, c = 67;
		var mapCenter = {x: tagpro.map.length * 20, y: tagpro.map[0].length * 20};
		var centerZoomTime = 1;

		function isArrowKey(keyPress) {
			var diff = keyPress.keyCode - OFFSET;
			return (0 <= diff) && (diff < 4);
		}

		function setCamera(position) {
			tagpro.viewPort.followPlayer = false;
			tagpro.viewPort.source = {
				x: position.x,
				y: position.y
			};
		}

		function plus(pos1, pos2) {
			return {
				x: pos1.x + pos2.x,
				y: pos1.y + pos2.y
			};
		}

		function timedLoop(numFrames, func) {
			(function centerLoop(n) {
                func();
                setTimeout(function() {
                    if (--n) {
                        centerLoop(n);
                    }
                }, 1000/60);
            })(numFrames); 
		}

	// ---------- KEYHOLD HANDLER ---------- \\

	function holdKey(keyCode) {
		var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

		var direction = {
			x: keyCode === LEFT ? -1 : (keyCode === RIGHT ? 1 : 0),
			y: keyCode === UP ?   -1 : (keyCode === DOWN    ? 1 : 0)
		};

		var speed = 4.5, loop = false;

		this.keyDown = function() { 
			loop = loop ||
		 	setInterval(function() { 
				tagpro.viewPort.source.x += direction.x * speed;
				tagpro.viewPort.source.y += direction.y * speed;
			}, 1000/60); 
		};

		this.keyUp = function() { 
			clearInterval(loop); 
			loop = false;
			console.log(loop);
		}
	}

	// ---------- CENTERING HANDLER ---------- \\

	function centerKey() {
		var mapCenter = {x: tagpro.map.length * 20, y: tagpro.map[0].length * 20};
		var centerZoomTime = 1;
		var numFrames = Math.round(centerZoomTime * 60);

		this.keyDown = function() {
			var delta = {
				x: (mapCenter.x - tagpro.viewPort.source.x) / numFrames,
				y: (mapCenter.y - tagpro.viewPort.source.y) / numFrames
			};

			timedLoop(numFrames, function() {
				tagpro.viewPort.source.x += delta.x;
				tagpro.viewPort.source.y += delta.y;
			});
		}
	}

	// ---------- MAIN LOGIC ---------- \\
		
		if (tagpro.spectator !== "watching") { return false; }

		var keyHandlers = [
			new holdKey(LEFT),
			new holdKey(DOWN),
			new holdKey(RIGHT),
			new holdKey(UP)   
		];

		var centerHandler = new centerKey();

		$(document).keydown(function(keyPress) {
			if (isArrowKey(keyPress)) {
				setCamera(tagpro.viewPort.source)
				keyHandlers[keyPress.keyCode - OFFSET].keyDown();
			} else if (keyPress.keyCode === c) {
				keyPress.preventDefault();
				// // setCamera(mapCenter);
				// var numFrames = Math.round(centerZoomTime * 60);
				// var delta = {
				// 	x: (mapCenter.x - tagpro.viewPort.source.x) / numFrames,
				// 	y: (mapCenter.y - tagpro.viewPort.source.y) / numFrames
				// };

				// (function centerLoop(n) {
	   //              setCamera(plus(tagpro.viewPort.source, delta));
	   //              setTimeout(function() {
	   //                  if (--n) {
	   //                      centerLoop(n);
	   //                  }
	   //              }, 1000/60);
	   //          })(numFrames);
				centerHandler.keyDown();
			}
		});

		$(document).keyup(function(keyPress) {
			if (isArrowKey(keyPress)) {
				keyHandlers[keyPress.keyCode - OFFSET].keyUp();
			}
		});
}

(function waitForMapLoad() {
    setTimeout(function() {
        if (typeof tagpro.map === "undefined") { //even using tagpro.ready gives me an error that map is
            waitForMapLoad();
        } else {
            FreeCamera();
        }
    }, 100);
})();