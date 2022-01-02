let map, defMap;


const mapWidth = 100, mapHeight = 100;


let SPECIAL_TILES = [{
	pos: {x: 3, y: 3},
	data: {t: -2}
}]
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