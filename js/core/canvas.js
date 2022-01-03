let c, c1, c2, ctx, ctx1, ctx2;

let tileStyle = {
	"-5"(i, j, ctx, x, y) {
		if (!map[x][y].data.forceWalkable) {
			ctx.fillStyle = "#245";
			ctx.shadowBlur = 0;
			if (y == 48) ctx.fillRect(i, j + 10, 20, 5);
			if (x == 48) ctx.fillRect(i + 7.5, j, 5, 25);
			ctx.fillRect(i + 5, j + 7.5, 10, 10);
		}
	},
	"-3"(x, y, ctx) {
		ctx.strokeStyle = "#d91";
		ctx.fillStyle = "#011";
		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;
		ctx.beginPath();
		ctx.moveTo(x + 2, y + 22)
		ctx.lineTo(x + 18, y + 22);
		ctx.lineTo(x + 18, y + 11);
		if (player.unlocks.base) {
			ctx.lineTo(x + 10, y + 3);
			ctx.lineTo(x + 2, y + 11);
		}
		ctx.lineTo(x + 2, y + 22)
		ctx.fill();
		ctx.stroke();
	},
	"-2"(x, y, ctx) {
		ctx.fillStyle = "#eaf";
		ctx.shadowBlur = 15;
		ctx.shadowColor = "#eaf";
		ctx.beginPath();
		ctx.moveTo(x + 10, y);
		ctx.lineTo(x + 20, y + 12.5);
		ctx.lineTo(x + 10, y + 25);
		ctx.lineTo(x, y + 12.5);
		ctx.fill();
	},
	"-1"(x, y, ctx) {
		ctx.shadowBlur = 0;
		ctx.fillStyle = "#aaf";
		ctx.fillText("@", x + 3, y + 20);
	},
	"0"() {},
	"1"(x, y, cctx) {
		if (cctx != ctx1)
			cctx.fillStyle = "#b84";
		cctx.shadowBlur = 0;
		cctx.fillRect(x + 1, y + 5, 18, 5);
		cctx.fillRect(x + 1, y + 15, 18, 5);
		cctx.fillRect(x + 4, y + 1, 5, 23);
		cctx.fillRect(x + 12, y + 1, 5, 23);
	},
	"2"(x, y, ctx, x1, y1) {
		ctx.strokeStyle = (Building.getByPos(x1, y1).level < 5 ? "#aae" : "#fd2");
		ctx.shadowBlur = 0;
		ctx.lineWidth = 4;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(x + 2, y + 2);
		ctx.lineTo(x + 2, y + 15);
		ctx.lineTo(x + 10, y + 23);
		ctx.lineTo(x + 18, y + 15);
		ctx.lineTo(x + 18, y + 2);
		ctx.stroke();
	}
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
	return [(x - player.pos.x + Math.floor(Math.floor(c.width/20)/2))*20,
	(y - player.pos.y + Math.floor(Math.floor(c.height/25)/2))*25];
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
	let yDiff = arrowDir == "top" ? -32 : 32;
	let length = context.measureText(text).width + 8,
		xDiff = length/2;
	context.fillRect(x - xDiff, y + yDiff, length, 25);
	context.strokeRect(x - xDiff, y + yDiff, length, 25);

	context.fillStyle = "#fff";
	context.beginPath();
	if (arrowDir == "top") {
		context.moveTo(x - 5, y - 7);
		context.lineTo(x + 5, y - 7);
		context.lineTo(x, y - 2);
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
		if (x < 0 || x > mapWidth - 1) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > mapHeight - 1) continue;
			ctx.fillStyle = `#33${"7" + ((Math.floor(x/4) + Math.floor(y/4))%2)*9}88`;
			ctx.shadowBlur = 0;
			ctx.fillRect(i*20, j*25, 20, 25);
		}
	}
	for (let i = 0; i <= width; i++) {
		let x = i + player.pos.x - Math.floor(width/2);
		if (x < 0 || x > mapWidth - 1) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > mapHeight - 1) continue;
			let tile = map[x][y].t;

			if (x == player.pos.x && y == player.pos.y)
				tile = -1;

			tileStyle[tile](i*20, j*25, ctx, x, y);
			if (BUILDINGS[tile] && Building.getByPos(x, y).upgrading) {
				tileStyle[1](i*20, j*25, ctx);
			}
		}
	}
}

function renderLayer1() {
	c1.style.opacity = 0.8;
	c1.width = window.innerWidth - 4;
	c1.height = window.innerHeight - 114;

	if (placeData.node) {

		let [x, y] = getXYfromDir(placeData.facing);
		let [px, py] = getPosInCanvas(x, y);

		if (!BUILDINGS[placeData.node].canPlace(x, y)) {
			ctx1.fillStyle = "#f00";
			ctx1.shadowColor = "#f00"
		} else {
			ctx1.fillStyle = "#b84";
			ctx1.shadowColor = "#b84";
		}

		tileStyle[1](px, py, ctx1);
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
				tooltipText(ctx2, x + 10, y, text, "bottom");
			} else {
				tooltipText(ctx2, x + 10, y, text, "top");
			}
		}
	}
}

function renderAll() {
	render();
	renderLayer1();
	renderLayer2();
}