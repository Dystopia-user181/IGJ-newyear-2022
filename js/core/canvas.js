let c, c1, c2, ctx, ctx1, ctx2;

let tileStyle = {
	"-1"(x, y) {
		ctx.fillStyle = "#88f";
		ctx.fillRect(x, y, 20, 25);
		ctx.fillStyle = "#000";
		ctx.fillText("@", x + 3, y + 20);
	},
	"0"() {}
}

function loadCanvas() {
	c = document.querySelector("#c");
	ctx = c.getContext("2d");
	c1 = document.querySelector("#c1");
	ctx1 = c1.getContext("2d");
	c2 = document.querySelector("#c2");
	ctx2 = c2.getContext("2d");

	updateTileUsage();
	renderAll();
	window.onresize = renderAll;
}

let canvas = {
	need0update: false,
	need1update: false,
	need2update: false,
	objs: {
		lights: [],
		areaC: [],
		sectorC: [],
		i: []
	}
}

const lights = [[351, 351]];
function clampWithinCanvas(x, y, buffer) {
	let [i, j] = getPosInCanvas(x, y);

	if (i <= -buffer*20) return false;
	if (i >= c.width + buffer*20) return false;
	if (j <= -buffer*25) return false;
	if (j >= c.height + buffer*25) return false;
	return true;
}

function getPosInCanvas(x, y) {
	return [(x - player.pos.x + Math.floor(Math.floor(c.width/20)/2))*20 + 10,
	(y - player.pos.y + Math.floor(Math.floor(c.height/25)/2))*25]
}
function getMapByCanvas(x, y) {
	let posX = Math.floor(x/20),
		posY = Math.floor(y/25);
	return [posX + player.pos.x - Math.floor(Math.floor(c.width/20)/2),
	posY + player.pos.y - Math.floor(Math.floor(c.height/25)/2)];
}


function tooltipText(context, x, y, text, arrowDir = "top") {
	context.font = '18px Iosevka Term SS08 Web';
	context.textAlign = "center";

	context.strokeStyle = "#fff";
	context.fillStyle = "#000b";
	context.lineWidth = 2;
	let yDiff = arrowDir == "top" ? -25 : 32;
	let length = context.measureText(text).width + 8,
		xDiff = length/2;
	context.fillRect(x - xDiff, y + yDiff, length, 25);
	context.strokeRect(x - xDiff, y + yDiff, length, 25);

	context.fillStyle = "#fff";
	context.beginPath();
	if (arrowDir == "top") {
		context.moveTo(x - 5, y);
		context.lineTo(x + 5, y);
		context.lineTo(x, y + 5);
	} else {
		context.moveTo(x - 5, y + 32);
		context.lineTo(x + 5, y + 32);
		context.lineTo(x, y + 27);
	}

	context.fill();

	context.fillText(text, x, y + yDiff + 19);
}
let pi = Math.PI
function render() {
	let testTime = Date.now();
	c.width = window.innerWidth - 4;
	c.height = window.innerHeight - 114;
	ctx.font = '25px Iosevka Term SS08 Web';

	let width = Math.floor(c.width/20),
		height = Math.floor(c.height/25);

	for (let i = 0; i <= width; i++) {
		let x = i + player.pos.x - Math.floor(width/2);
		if (x < 0 || x > 99) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > 99) continue;
			let tile = map[x][y].t;
			ctx.fillStyle = `#11${50 + ((Math.floor(x/4) + Math.floor(y/4))%2)*5}00`;
			ctx.fillRect(i*20, j*25, 20, 25);

			if (x == player.pos.x && y == player.pos.y)
				tile = -1;

			tileStyle[tile](i*20, j*25);
		}
	}
}

function renderLayer1() {
	c1.width = window.innerWidth - 4;
	c1.height = window.innerHeight - 114;

	if (placeData.node) {
		ctx1.font = '25px Iosevka Term SS08 Web';
		ctx1.textAlign = "center";

		let [x, y] = getXYfromDir(placeData.facing);
		let [px, py] = getPosInCanvas(x, y);
		py += 25;

		ctx1.shadowBlur = 15;
		if (!BUILDINGS[placeData.node].canPlace(x, y)) {
			ctx1.fillStyle = "#f00";
			ctx1.shadowColor = "#f00"
		} else {
			ctx1.fillStyle = tileStyle[placeData.node];
			ctx1.shadowColor = tileStyle[placeData.node];
		}

		ctx1.fillText(placeData.node, px, py)
	}
}

function renderLayer2() {
	c2.width = window.innerWidth - 4;
	c2.height = window.innerHeight - 114;

	if (player.options.showTilePopups) {
		ctx2.font = '18px Iosevka Term SS08 Web';
		ctx2.textAlign = "center";
	
		for (let i of accessData.tiles) {
			let [x, y] = getPosInCanvas(...getXYfromDir(i));
			let text = "Use [" + ["D", "S", "A", "W"][i] + "]";
			if (i == 1 || i == 2) {
				tooltipText(ctx2, x, y, text, "bottom");
			} else {
				tooltipText(ctx2, x, y, text, "top");
			}
		}
	}
}

function renderAll() {
	render();
	renderLayer1();
	renderLayer2();
}