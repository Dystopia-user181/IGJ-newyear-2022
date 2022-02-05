function setPos(x, y) {
	player.pos.x = x;
	player.pos.y = y;
}

function loadControls() {
	window.addEventListener("keydown", function (e) {
		let key = e.key.toLowerCase();
		if (typeof controls["press" + key.toUpperCase()] == "function") controls["press" + key.toUpperCase()](e);
		if (controls[key] != undefined)
			controls[key] = true;
	})

	window.addEventListener("keyup", function (e) {
		let key = e.key.toLowerCase();
		if (controls[key] != undefined) controls[key] = false;
	})

	new Updater(function () {
		if (Modal.showing) return;
		let right = controls.d || controls.arrowright,
			left = controls.a || controls.arrowleft,
			up = controls.w || controls.arrowup,
			down = (controls.s && !controls.control) || controls.arrowdown;

		if (right || left || up || down) {
			controls.ticks++;

			if (controls.shift) {
				if (right) 
					placeData.facing = 0;
				else if (left)
					placeData.facing = 2;
				else if (up)
					placeData.facing = 3;
				else if (down) 
					placeData.facing = 1;
			}
			
			canvas.need1update = true;
		} else {
			controls.ticks = 0;
		}

		if (controls.ticks != 1) {
			controls.ticks = controls.ticks%(player.obelisk.repairing ? Math.floor(4*Math.pow(player.obelisk.time + 1, 0.7)) : 4);
			return;
		}

		if (controls.shift && placeData.node) return;

		let {x, y} = player.pos;

		if (left && accessData.tiles.includes(2)) {
			openMenu(...getXYfromDir(2))
			return;
		}
		if (right && accessData.tiles.includes(0)) {
			openMenu(...getXYfromDir(0))
			return;
		}
		if (up && accessData.tiles.includes(3)) {
			openMenu(...getXYfromDir(3))
			return;
		}
		if (down && accessData.tiles.includes(1)) {
			openMenu(...getXYfromDir(1))
			return;
		}

		if (right && checkTileAccess(x + 1, y)) {
			player.pos.x++;
			x++; //Needed to prevent diagonal clipping into blocks. Don't remove it again!
		} else if (left && checkTileAccess(x - 1, y)) {
			player.pos.x--;
			x--;
		}
		if (up && checkTileAccess(x, y - 1)) {
			player.pos.y--;
		} else if (down && checkTileAccess(x, y + 1)) {
			player.pos.y++;
		}

		render();
		renderLayer1();
		renderLayer2();
		updateTileUsage();
	})
}

let controls = {
	w: false,
	a: false,
	s: false,
	d: false,
	q: false,
	n: false,
	shift: false,
	control: false,
	"press "() {
		if (paused) return;
		Building.stopPlacing();
	},
	arrowup: false,
	arrowleft: false,
	arrowdown: false,
	arrowright: false,
	pressE() {
		if (!Modal.showing)
			openMenu(2, 2);
		else if (!paused)
			Modal.closeFunc();
	},
	pressS(e) {
		e.preventDefault();
		if (paused || !controls.control) return;
		save();
	},
	pressU() {
		if (Modal.showing && Modal.data.bindData.canUpg)
			Building.level(Modal.data.bindData.x, Modal.data.bindData.y);
	},
	pressI() {
		if (Modal.showing && Modal.data.bindData.isBuilding && !(
			Modal.data.bind == "goldmine-menu" && buildingAmt(2) < 2
		))
			Building.sell(Modal.data.bindData.x, Modal.data.bindData.y);
	},
	pressO() {
		if (!Modal.showing)
			if (player.obelisk.repaired)
				openMenu(10, 10);
	},
	pressQ() {
		Modal.show({
			title: 'Quick Access',
			bind: 'quick-access',
			style: {width: '750px', height: '500px'}
		})
	},
	pressESCAPE() {
		if (Modal.showing)
			Modal.closeFunc();
		else if (placeData.node) {
			placeData.node = "";
			canvas.need1update = true;
		} else {
			paused = true;
			Modal.show({
				title: 'Paused',
				text: `<br><br>Paused`,
				close() {
					paused = false;
					Modal.close();
				},
				buttons: [{text: 'Unpause', onClick() {Modal.closeFunc()}}]
			});
		}
	},
	ticks: 0
}


let walkable = [0];
function getXYfromDir(dir, t) {
	let {x, y} = player.pos;
	if (t) {
		x = t[0];
		y = t[1];
	}
	dir = Number(dir);
	switch (dir) {
		case 0: return [x + 1, y];
		case 1: return [x, y + 1];
		case 2: return [x - 1, y];
		case 3: return [x, y - 1];
	}
}
function checkTileAccess(x, y) {
	if (x > mapWidth - 1 || x < 0) return false;
	if (y > mapHeight - 1 || y < 0) return false;
	return walkable.includes(map[x][y].t) || map[x][y].data?.forceWalkable;
}
function updateTileUsage() {
	accessData.tiles = [];

	let dirList = [0, 1, 2, 3];
	for (let i in dirList) {
		let [x, y] = getXYfromDir(i);
		if (x < 0 || x > mapWidth - 1 || y < 0 || y > mapHeight - 1) continue;
		if (MENU_DATA[map[x][y].t] && !map[x][y].data?.forceWalkable) accessData.tiles.push(Number(i));
	}

	canvas.need2update = true;
}
function clearControls() {
	for (let i in controls) {
		if (typeof controls[i] == "boolean")
			controls[i] = false;
	}
}
document.addEventListener( 'visibilitychange' , function() {
	if (document.hidden) {
		clearControls();
	}
}, false );
window.onblur = function() {
	clearControls();
}
window.oncontextmenu = function () {
	if (!isMobile)
		clearControls();
}