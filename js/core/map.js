let map, defMap;


const mapWidth = 96, mapHeight = 96;


let SPECIAL_TILES = [{
	pos: {x: 3, y: 3},
	data: {t: -2}
}, {
	pos: {x: 20, y: 20},
	data: {t: -3}
}, {
	pos: {x: 49, y: 49},
	data: {t: -4}
}, {
	pos: {x: 51, y: 51},
	data: {t: -6}
}]
for (let i = 0; i < 49; i++) {
	SPECIAL_TILES.push({
		pos: {x: i, y: 48},
		data: {t: -5, data: {forceWalkable: false}}
	})
	SPECIAL_TILES.push({
		pos: {x: 48, y: i},
		data: {t: -5, data: {forceWalkable: false}}
	})
}
for (let i = 0; i < 65; i++) {
	SPECIAL_TILES.push({
		pos: {x: i, y: 64},
		data: {t: -7, data: {forceWalkable: false}}
	})
	SPECIAL_TILES.push({
		pos: {x: 64, y: i},
		data: {t: -7, data: {forceWalkable: false}}
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