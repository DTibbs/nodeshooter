
// server side tracking & updating of enemies and bullets
var enemies = [];
var clientEnemies = [];
var bullest = [];
var curEnemyID = 0;
function Enemy(ID) {
	var I = {};
	I.active = true;
	I.age = Math.floor(Math.random() * 128);

	// Initial pos at top somewhere between 25% and 75% of width
	I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = 2;

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH &&
		I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity = 2 * Math.sin(I.age * Math.PI / 64);

		I.age++;

		I.active = I.active && I.inBounds();
	};

	I.explode = function() {
		this.active = false;
		// Extra Credit: Add an explosion graphic
	};

	return I;
}
