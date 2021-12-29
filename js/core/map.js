let map, defMap;

let SPECIAL_TILES = []
function loadMap() {
	let prevTime = Date.now();

	let defaultMap = [];
	for (let i = 0; i < 100; i++) {
		defaultMap.push([]);
		for (let j = 0; j < 100; j++) {
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
	return 0
}