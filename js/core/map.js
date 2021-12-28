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
	if (localStorage.getItem(saveKey + 'map') != null) {
		try {
			map = JSON.parse(localStorage.getItem(saveKey + 'map'));
		} catch (error) {
			map = deepcopy(defMap);
			console.log(error);
		}
	}
	else
		map = deepcopy(defMap);

	console.log("Finished loadMap: " + (Date.now() - prevTime) + "ms");
}

function getMapEmpty(x, y) {
	return {t: 0}
}