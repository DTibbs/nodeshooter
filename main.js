var kDPADRadius = 70;
var kBulletSpeed = 19;
var canvas = null;
var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;

//Util function to calculate velocity once, vDir can be non-normalized
function calcVel(vDir){
	var totalDelta = 1;
	var result = {x:0,y:0};
	if(vDir.x !== undefined && vDir.y !== undefined)
	{
		totalDelta = Math.abs(vDir.x) + Math.abs(vDir.y);
	}
	else
	{
		vDir = {x:0,y:1};
	}
	
	result.x = vDir.x / totalDelta;
	result.y = vDir.y / totalDelta;
	var diff = Math.abs(result.x - result.y);
	result.x += (0.4 * result.x) - (0.4 * diff);
	result.y += (0.4 * result.y) - (0.4 * diff);
	result.x *= kBulletSpeed;
	result.y *= kBulletSpeed;
	
	return result;
}

// Util function for collision detection
function collides(a, b) {
	return a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y;
}

function Bullet(I) {
	I.active = true;
	
	//I.vel = {x:0,y:0};
	I.width = 3;
	I.height = 3;
	I.color = "#000";
	
	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH &&
		I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};
	
	I.draw = function(canvas) {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	};
	
	I.update = function() {
		I.x += I.vel.x;
		I.y += I.vel.y;
		I.active = I.active && I.inBounds();
	};
	
	return I;
}

var enemies = [];
//function Enemy(I) {
//	I = I || {};
//
//	I.color = "#A2B";
//	I.x = 0;
//	I.y = 0;
//
//	I.width = 32;
//	I.height = 32;
//	//I.image = loadImage("http://opengameart.org/sites/default/files/creaturedesign1.jpg");
//
//	I.draw = function(canvas) {
//		canvas.fillStyle = this.color;
//		canvas.fillRect(this.x, this.y, this.width, this.height);
//		//var w = this.image.width;
//		//var h = this.image.height;
//		//canvas.drawImage(this.image, 0, 0, w, h, this.x, this.y, this.width, this.height);
//	};
//
//	return I;
//}


var PlayerController = function() { return this; };
PlayerController.prototype = {
	score:0,
	bShooting: false,
	playerBullets: [],
	shootPos: {x:0,y:0},
	touchPos: {x:0,y:0},
	ctrlPos: {},
	color: "#00A",
	x: 220,
	y: 270,
	width: 32,
	height: 32,
	draw: function(canvas) {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	},
	shoot: function() {
		var bltPos = this.midpoint();
	
		this.playerBullets.push(Bullet({
			speed: kBulletSpeed,
			x: bltPos.x,
			y: bltPos.y,
			vel: calcVel({x:this.shootPos.x - bltPos.x,y:this.shootPos.y - bltPos.y})
		}));
	},
	midpoint: function() {
		return {
			x: this.x + this.width/2,
			y: this.y + this.height/2
		};
	},
	explode: function() {
		//this.active = false;
		// Extra Credit: Add an explosion graphic and then end the game
	}
};

var myPlayerController = new PlayerController();

// Start with just myPlayerController
var players = [];
players[0] = myPlayerController;

function setupControls() {
	// TOUCH CONTROLS!!
	document.ontouchstart = function(event){
		if(myPlayerController !== undefined && myPlayerController.ctrlPos.tID === 0){
			var touch = event.touches[0];
			myPlayerController.ctrlPos.x = myPlayerController.touchPos.x = touch.pageX;
			myPlayerController.ctrlPos.y = myPlayerController.touchPos.y = touch.pageY;
			myPlayerController.ctrlPos.tID = touch.identifier;
		}
		else if(event.changedTouches.length > 0) {
			myPlayerController.bShooting = true;
			myPlayerController.shootPos.x = event.changedTouches[0].pageX;
			myPlayerController.shootPos.y = event.changedTouches[0].pageY;
		}
	};
	document.ontouchmove = function(event){ 
		event.preventDefault();
		if(event.touches.length > 0 && myPlayerController.ctrlPos.tID !== 0) {
			for(var d = 0; d < event.touches.length; ++d) {
				var touch = event.touches[d];
				if(touch.identifier === myPlayerController.ctrlPos.tID) {
					myPlayerController.touchPos.x = touch.pageX;
					myPlayerController.touchPos.y = touch.pageY;
				} else {
					myPlayerController.shootPos.x = touch.pageX;
					myPlayerController.shootPos.y = touch.pageY;
				}
			}
		}
	};
	document.ontouchend = function(event){
		if(event.touches.length === 0) {
			myPlayerController.ctrlPos.x = 0;
			myPlayerController.ctrlPos.y = 0;
			myPlayerController.ctrlPos.tID = 0;
			myPlayerController.touchPos.x = 0;
			myPlayerController.touchPos.y = 0;
		} else if(event.touches.length == 1){
			myPlayerController.bShooting = false;
		}
	};

	// MOUSE/KEYBOARD, not as fun
	document.onmousemove = function(event){
		myPlayerController.shootPos.x = event.pageX;
		myPlayerController.shootPos.y = event.pageY;
	};
	document.onmousedown = function(event){
		myPlayerController.bShooting = true;
		myPlayerController.shootPos.x = event.pageX;
		myPlayerController.shootPos.y = event.pageY;
		//console.log(event);
	};
	document.onmouseup = function(event){
		myPlayerController.bShooting = false;
	};
	$('body').keydown(function(event) {
		event.preventDefault();
		switch(event.which) {
			// left arrow	
			case 37:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 999;
				myPlayerController.touchPos.x = -100;
				break;
			// up arrow
			case 38:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 999;
				myPlayerController.touchPos.y = -100;
				break;
			// right arrow
			case 39:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 999;
				myPlayerController.touchPos.x = 100;
				break;
			// down arrow
			case 40:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 999;
				myPlayerController.touchPos.y = 100;
				break;
		}
	});
	$('body').keyup(function(event) {
		event.preventDefault();
		switch(event.which) {
			// left arrow	
			case 37:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 0;
				myPlayerController.touchPos.x = 0;
				break;
			// up arrow
			case 38:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 0;
				myPlayerController.touchPos.y = 0;
				break;
			// right arrow
			case 39:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 0;
				myPlayerController.touchPos.x = 0;
				break;
			// down arrow
			case 40:
				// faking the touch control position's touch ID
				myPlayerController.ctrlPos.tID = 0;
				myPlayerController.touchPos.y = 0;
				break;
		}
	});
}

var Game = {
	bGameOver: false,
	wsConnection: undefined,
	load: function() {
		setupControls();
		canvas = $("#canvy").get(0).getContext("2d");
		myPlayerController.ctrlPos = {
				x:0,
				y:0,
				tID:0,
				draw: function(canvas) {
					if(this.tID !== 0) {
						canvas.beginPath();
						canvas.arc(this.x, this.y, kDPADRadius, 0, Math.PI*2, true);
						canvas.stroke();
					}
				}
		};
	},
	update: function () {
		if(myPlayerController.bShooting) {
			myPlayerController.shoot();
		}
		if(myPlayerController.ctrlPos.tID !== 0) {
			if(myPlayerController.touchPos.x < myPlayerController.ctrlPos.x - kDPADRadius){
				myPlayerController.x -= 5; }
			if(myPlayerController.touchPos.x > myPlayerController.ctrlPos.x + kDPADRadius){
				myPlayerController.x += 5; }
			if(myPlayerController.touchPos.y < myPlayerController.ctrlPos.y - kDPADRadius){
				myPlayerController.y -= 5; }
			if(myPlayerController.touchPos.y > myPlayerController.ctrlPos.y + kDPADRadius){
				myPlayerController.y += 5;}
			
			this.wsConnection.send(JSON.stringify({type:'playerUpdate', data:{x:myPlayerController.x,y:myPlayerController.y}}));
		}
		
		myPlayerController.playerBullets.forEach(function(bullet) {
			bullet.update();
		});
		myPlayerController.playerBullets = myPlayerController.playerBullets.filter(function(bullet) {
			return bullet.active;
		});
//		players.forEach(function(player) {
//			if(player.bShooting) {
//				player.shoot();
//			}
//			if(player.ctrlPos.tID !== 0) {
//				if(player.touchPos.x < player.ctrlPos.x - kDPADRadius){
//					player.x -= 5; }
//				if(player.touchPos.x > player.ctrlPos.x + kDPADRadius){
//					player.x += 5; }
//				if(player.touchPos.y < player.ctrlPos.y - kDPADRadius){
//					player.y -= 5; }
//				if(player.touchPos.y > player.ctrlPos.y + kDPADRadius){
//					player.y += 5;}
//			}
//
//			player.playerBullets.forEach(function(bullet) {
//				bullet.update();
//			});
//			player.playerBullets = player.playerBullets.filter(function(bullet) {
//				return bullet.active;
//			});
//		});	// end players.forEach
		
		//this.handleCollisions();
	},	//end update: function() {
	delta:0,
	lastTime:0,
	totalTime:0,
	updateTime:0,
	frames:0,
	updateFrames:0,
	calcFrameRate: function() {
		var now = (new Date()).getTime();
	    this.delta = now-this.lastTime;
	    this.lastTime = now;
	    this.totalTime+=this.delta;
	    this.frames++;
	    this.updateTime+=this.delta;
	    this.updateFrames++;
	    if(this.updateTime > 1000) {
	        //canvas.font = "20pt Lucida Console";
			//canvas.fillStyle = '#00f';
			//canvas.fillText("FPS AVG: " + (1000*this.frames/this.totalTime) + " CUR: " + (1000*this.updateFrames/this.updateTime), 0, 0);
	    	document.getElementById('fps').innerHTML = "FPS AVG: " + (1000*this.frames/this.totalTime) + " CUR: " + (1000*this.updateFrames/this.updateTime);
			this.updateTime = 0;
			this.updateFrames =0;
	    }
	},

	draw: function() {
		if(canvas.canvas.width !== CANVAS_WIDTH ||
			canvas.canvas.height !== CANVAS_HEIGHT) {
				// Just as good as clearRect:
				canvas.canvas.width = CANVAS_WIDTH;
				canvas.canvas.height = CANVAS_HEIGHT;
		}
		
		this.calcFrameRate();
		//canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		//canvas.shadowOffsetX = 5;
		//canvas.shadowOffsetY = 5;
		//canvas.shadowBlur		= 4;
		//canvas.shadowColor	 = 'rgba(255, 0, 0, 0.5)';
		canvas.fillStyle		 = '#0ff';
		canvas.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		canvas.font = "20pt Lucida Console";
		canvas.fillStyle = '#00f';
		canvas.fillText("SCORE: " + myPlayerController.score, CANVAS_WIDTH / 2, 50);

		players.forEach(function(player) {
			player.draw(canvas);
			//player.playerBullets.forEach(function(bullet) {
			//	bullet.draw(canvas);
			//});
		});
		myPlayerController.ctrlPos.draw(canvas);

		enemies.forEach(function(enemy) {
			canvas.fillStyle = '#A2B';
			canvas.fillRect(enemy.x, enemy.y, 32, 32);
		});
	},
	
	GameOver: function() {
		canvas.font = "20pt Lucida Console";
		canvas.fillStyle = '#00f';
		canvas.fillText("GAME OVER", 50, 50);
	},

//	handleCollisions: function() {
//		players.forEach(function(player) {
//			player.playerBullets.forEach(function(bullet) {
//				enemies.forEach(function(enemy) {
//					if (collides(bullet, enemy)) {
//						// TODO: Score per-player not just myPlayerController
//								myPlayerController.score++;
//						enemy.explode();
//						bullet.active = false;
//					}
//				});
//			});
//
////			enemies.forEach(function(enemy) {
////				if (collides(enemy, player)) {
////					enemy.explode();
////					player.explode();
////				}
////			});
//		});
//	},
	
	addPlayer: function(userID) {
		players[userID] = new PlayerController();
		// non local players are green
		players[userID].color = "#0A0";
	},
	
	updatePlayer: function(playerData) {
		// playerData should have userID and position info
		if(playerData.userID !== 0) {
			players[playerData.userID].x = playerData.x;
			players[playerData.userID].y = playerData.y;
		}
	},
	
	removePlayer: function(userID) {
		delete players[userID];
	},

	updateEnemies: function(enemyArray) {
		enemies = enemyArray;
	},
	
	drawString: function(string, x, y) {
		canvas.font = "20pt Lucida Console";
		canvas.fillStyle = '#00f';
		canvas.fillText(string, x, y);
	},
};


