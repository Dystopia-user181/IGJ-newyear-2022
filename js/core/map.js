let map, defMap;


const mapWidth = 32, mapHeight = 32;
function displayWidth() {
	if (!player.timewall.one.destroyed) return 9;
	if (!player.timewall.two.destroyed) return 17;
	return 32;
}
function displayHeight() {
	if (!player.timewall.one.destroyed) return 9;
	if (!player.timewall.two.destroyed) return 17;
	return 32;
}


let SPECIAL_TILES = [{
	pos: {x: 2, y:2},
	data: {t: -2}
}, {
	pos: {x: 3, y: 3},
	data: {t: -3}
}, {
	pos: {x: 9, y: 9},
	data: {t: -4}
}, {
	pos: {x: 10, y: 10},
	data: {t: -6}
}, {
	pos: {x: 20, y: 20},
	data: {t: -8}
}]
for (let i = 0; i < 9; i++) {
	SPECIAL_TILES.push({
		pos: {x: i, y: 8},
		data: {t: -5, data: {forceWalkable: false}},
		force: false
	})
	SPECIAL_TILES.push({
		pos: {x: 8, y: i},
		data: {t: -5, data: {forceWalkable: false}},
		force: false
	})
}
for (let i = 0; i < 17; i++) {
	SPECIAL_TILES.push({
		pos: {x: i, y: 16},
		data: {t: -7, data: {forceWalkable: false}},
		force: false
	})
	SPECIAL_TILES.push({
		pos: {x: 16, y: i},
		data: {t: -7, data: {forceWalkable: false}},
		force: false
	})
}
function loadMap() {
	let prevTime = Date.now();

	let defaultMap = [];
	for (let i = 0; i < mapWidth; i++) {
		defaultMap.push([]);
		for (let j = 0; j < mapHeight; j++) {
			defaultMap[i][j] = {t: 0};
		}
	}
	defMap = deepcopy(defaultMap);
	console.log("Finished map generation: " + (Date.now() - prevTime) + "ms");

	for (let i of SPECIAL_TILES) {
		defMap[i.pos.x][i.pos.y] = deepcopy(i.data);
	}
	map = deepcopy(defMap);

	console.log("Finished loadMap: " + (Date.now() - prevTime) + "ms");
}
function fixMap() {
	for (let i of SPECIAL_TILES) {
		map[i.pos.x][i.pos.y] = deepcopy(i.data);
	}
}

function getMapEmpty(x, y) {
	return 0;
}

function getMap(x, y) {
	// needed so vue doesn't freak out whenever loading a component that needs to use map
	return map[x][y];
}