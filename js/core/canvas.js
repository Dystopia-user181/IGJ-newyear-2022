let c, c1, c2, ctx, ctx1, ctx2;

const px = 25, py = 30;
let tileStyle = {
	"-6"(i, j, ctx) {
		let w = Math.min(px, py);
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.arc(i + px/2, j + py/2, w/2 - 2, 0, Math.PI*2);
		ctx.moveTo(i + px/2, j + py/2);
		ctx.lineTo(i + px/2, j + py/2 - w/3);
		ctx.moveTo(i + px/2, j + py/2);
		ctx.lineTo(i + px/2 + w/8, j + py/2 + w*0.216);
		ctx.stroke();
	},
	"-5"(i, j, ctx, x, y) {
		if (!map[x][y].data.forceWalkable) {
			ctx.fillStyle = "#245";
			ctx.shadowBlur = 0;
			if (y == 48) ctx.fillRect(i, j + py/2 - 2.5, px, 5);
			if (x == 48) ctx.fillRect(i + px/2 - 2.5, j, 5, py);
			ctx.fillRect(i + px/4, j + py/2 - px/4, px/2, px/2);
		}
	},
	"-4"(x, y, ctx) {
		ctx.fillStyle = "#aaa";
		ctx.fillRect(x + px/8, y + py/16, px*3/4, py*3/8);
		ctx.fillStyle = "#a82";
		ctx.fillRect(x + px*5/12, y + py*7/16, px/6, py/2);
	},
	"-3"(x, y, ctx) {
		ctx.strokeStyle = "#d91";
		ctx.fillStyle = "#011";
		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;
		ctx.beginPath();
		ctx.moveTo(x + 2, y + py - 3)
		ctx.lineTo(x + px - 2, y + py - 3);
		ctx.lineTo(x + px - 2, y + py/2 - 1);
		if (player.unlocks.base) {
			ctx.lineTo(x + px/2, y + 3);
			ctx.lineTo(x + 2, y + py/2 - 1);
		}
		ctx.lineTo(x + 2, y + py - 3)
		ctx.fill();
		ctx.stroke();
	},
	"-2"(x, y, ctx) {
		ctx.fillStyle = "#eaf";
		ctx.shadowBlur = 15;
		ctx.shadowColor = "#eaf";
		ctx.beginPath();
		ctx.moveTo(x + px/2, y);
		ctx.lineTo(x + px, y + py/2);
		ctx.lineTo(x + px/2, y + py);
		ctx.lineTo(x, y + py/2);
		ctx.fill();
	},
	"-1"(x, y, ctx) {
		ctx.shadowBlur = 0;
		ctx.fillStyle = "#aaf";
		ctx.fillText("@", x + px/2, y + py*0.85);
	},
	"0"() {},
	"1"(x, y, cctx) {
		if (cctx != ctx1)
			cctx.fillStyle = "#b84";
		cctx.shadowBlur = 0;
		let w = py/5
		cctx.fillRect(x + 1, y + w, px - 2, w);
		cctx.fillRect(x + 1, y + w*3, px - 2, w);
		cctx.fillRect(x + px/5, y + 1, w, py - 2);
		cctx.fillRect(x + px*3/5, y + 1, w, py - 2);
	},
	"2"(x, y, ctx, x1, y1) {
		let level = Building.getByPos(x1, y1).level;
		ctx.strokeStyle = (level < 4 ? "#aae" : "#db6");
		ctx.shadowBlur = 0;
		let w = px/5;
		ctx.lineWidth = w;
		ctx.beginPath();
		ctx.moveTo(x + w/2, y + w/2 + 1);
		ctx.lineTo(x + w/2, y + py*3/5);
		ctx.lineTo(x + px/2, y + py - w/2);
		ctx.lineTo(x + px - w/2, y + py*3/5);
		ctx.lineTo(x + px - w/2, y + w/2 + 1);
		ctx.stroke();

		if (level > 0) {
			ctx.strokeStyle = "#eef";
			ctx.lineWidth = w/2;
			ctx.beginPath();
			ctx.moveTo(x + w*3/4, y + w/4);
			ctx.lineTo(x + w*3/4, y + py*3/5);
			ctx.lineTo(x + px/2, y + py - w*3/4);
			ctx.lineTo(x + px - w*3/4, y + py*3/5);
			ctx.lineTo(x + px - w*3/4, y + w/4);
			ctx.stroke();
		}
		if (level > 2) {
			ctx.beginPath();
			ctx.fillStyle = "#da1";
			ctx.arc(x + px/2, y + px/2.5, w, 0, Math.PI*2);
			ctx.fill();
		}
		if (level > 1) {
			ctx.beginPath();
			ctx.fillStyle = "#fd2";
			ctx.arc(x + px/2, y + px/2, w, 0, Math.PI*2);
			ctx.fill();
		}
		if (level > 4) {
			ctx.beginPath();
			ctx.fillStyle = "#b8f";
			ctx.arc(x + px/2, y + px/2, w*0.6, 0, Math.PI*2);
			ctx.fill();
		}
	},
	"3"(i, j, ctx, x, y) {
		let level = Building.getByPos(x, y).level;
		ctx.fillStyle = (level > 1 ? "#9ab" : "#a83");
		ctx.shadowBlur = 0;
		ctx.fillRect(i + 1, j + px/8, px/8 - 1, py - px/4);
		ctx.fillRect(i + px*7/8, j + px/8, px/8 - 1, py - px/4);
		ctx.fillRect(i + 1, j + py - px/8, px - 2, px/8);

		if (level > 0) {
			ctx.fillStyle = "#a3f";
			ctx.fillRect(i + px/6, j + py*0.4, px*2/3, py*0.2);
			ctx.fillRect(i + px*0.4, j + py/6, px*0.2, py*2/3);
		}
		ctx.fillStyle = Currency.essence.colour;
		ctx.beginPath();
		ctx.arc(i + px/2, j + py/2, px*0.25, 0, Math.PI*2);
		ctx.fill();
	},
	"4"(i, j, ctx) {
		ctx.fillStyle = "#aaa";
		ctx.shadowBlur = 0;
		ctx.fillRect(i + px/8, j + py/8, px*0.75, py*0.75);

		ctx.fillStyle = Currency.essence.colour;
		ctx.fillRect(i + px*5/12, j + py/8, px/6, py*0.75);
		ctx.fillRect(i + px/8, j + py*5/12, px*0.75, py/6);
		ctx.shadowBlur = 10;
		ctx.shadowColor = "#f3f";
		ctx.beginPath();
		ctx.arc(i + px/2, j + py/2, px/4, 0, Math.PI*2);
		ctx.fill();
		ctx.shadowBlur = 0;
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

	if (i <= -buffer*px) return false;
	if (i >= c.width + buffer*px) return false;
	if (j <= -buffer*py) return false;
	if (j >= c.height + buffer*py) return false;
	return true;
}

function getPosInCanvas(x, y) {
	return [(x - player.pos.x + Math.floor(Math.floor(c.width/px)/2))*px,
	(y - player.pos.y + Math.floor(Math.floor(c.height/py)/2))*py];
}
function getMapByCanvas(x, y) {
	let posX = Math.floor(x/px),
		posY = Math.floor(y/py);
	return [posX + player.pos.x - Math.floor(Math.floor(c.width/px)/2),
	posY + player.pos.y - Math.floor(Math.floor(c.height/py)/2)];
}


function tooltipText(context, x, y, text, arrowDir = "top") {
	context.font = (py*18/25) + 'px Iosevka Term SS08 Web';
	context.textAlign = "center";

	context.strokeStyle = "#fff";
	context.fillStyle = "#000b";
	context.lineWidth = 2;
	let yDiff = arrowDir == "top" ? -py - 7 : py + 7;
	let length = context.measureText(text).width + 8,
		xDiff = length/2;
	context.fillRect(x - xDiff, y + yDiff, length, py);
	context.strokeRect(x - xDiff, y + yDiff, length, py);

	context.fillStyle = "#fff";
	context.beginPath();
	if (arrowDir == "top") {
		context.moveTo(x - 5, y - 7);
		context.lineTo(x + 5, y - 7);
		context.lineTo(x, y - 2);
	} else {
		context.moveTo(x - 5, y + py + 7);
		context.lineTo(x + 5, y + py + 7);
		context.lineTo(x, y + py + 2);
	}

	context.fill();

	context.fillText(text, x, y + yDiff + py*19/25);
}
let pi = Math.PI
function render() {
	let testTime = Date.now();
	c.width = window.innerWidth - 4;
	c.height = window.innerHeight - 114;
	ctx.font = py + 'px Iosevka Term SS08 Web';
	ctx.textAlign = 'center';

	let width = Math.floor(c.width/px),
		height = Math.floor(c.height/py);

	for (let i = 0; i <= width; i++) {
		let x = i + player.pos.x - Math.floor(width/2);
		if (x < 0 || x > mapWidth - 1) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > mapHeight - 1) continue;
			ctx.fillStyle = `#33${"7" + ((Math.floor(x/4) + Math.floor(y/4))%2)*9}88`;
			ctx.shadowBlur = 0;
			ctx.fillRect(i*px, j*py, px, py);

			ctx.fillStyle = "#c3c4";
			for (let k = Math.max(x - 1, 0); k <= Math.min(x + 1, mapWidth - 1); k++) {
				for (let l = Math.max(y - 1, 0); l <= Math.min(y + 1, mapHeight - 1); l++) {
					if (map[k][l].t == 4) {
						ctx.fillRect(i*px, j*py, px, py);
					}
				}
			}
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

			tileStyle[tile](i*px, j*py, ctx, x, y);
			if (BUILDINGS[tile] && Building.getByPos(x, y).upgrading) {
				tileStyle[1](i*px, j*py, ctx);
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
				tooltipText(ctx2, x + px/2, y, text, "bottom");
			} else {
				tooltipText(ctx2, x + px/2, y, text, "top");
			}
		}
	}
	if (player.obelisk.repairing) {
		ctx2.fillStyle = "#000000" + ("0" + Math.floor(Math.pow(player.obelisk.time.toNumber(), 2)*4).toString(16)).slice(-2);
		ctx2.fillRect(0, 0, c2.width, c2.height);
	}
}

function renderAll() {
	render();
	renderLayer1();
	renderLayer2();
}