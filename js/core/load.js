let request;
let db;

function load() {
	setTimeout(function() {
		let testTime = Date.now();
		loadMap();
		loadPlayer();
		loadDBdata(testTime);
	}, 100);
}

function loadDBdata(testTime) {
	if (!window.indexedDB) {
		loadAfterPlayerLoad(testTime);
		Notifier.error("Your game is not being saved because indexedDB is disabled.");
		return;
	}
	request = indexedDB.open(saveKey, 1);
	request.onerror = function(event) {
		Notifier.notify("Could not access indexedDB when saving.");
	};
	request.onupgradeneeded = function(event) {
		let db = event.target.result;
		objectStore = db.createObjectStore("data", {keyPath: "id"});
		objectStore.transaction.oncomplete = function(event) {
			db.transaction("data", "readwrite").objectStore("data").add({player: deepcopy(player), map: deepcopy(map), id: "1"});
		}
	}
	request.onsuccess = function(event) {
		console.log("request success")
		db = request.result;

		let transaction = db.transaction("data");
		transaction.objectStore("data").get("1").onsuccess = function(event) {
			let data = event.target.result;
			if (data) {
				map = deepcopy(data.map);
				decimaliseArray(map, struct.map);
				if (map.length < mapWidth) {
					while (map.length < mapWidth) {
						let x = [];
						for (let i = 0; i < mapWidth; i++) {
							x.push({t: 0});
						}
						map.push(x);
					}
				}
				if (map.length > mapWidth) {
					map = map.slice(0, mapWidth);
				}
				if (map[0].length < mapHeight) {
					while (map[0].length < mapHeight) {
						let x = map[0].length;
						for (let i = 0; i < mapWidth; i++) {
							map[i][x] = {t: 0};
						}
					}
				}
				if (map[0].length > mapHeight) {
					map = map.map(sub => sub.slice(0, mapWidth));
				}
				for (let i of SPECIAL_TILES) {
					if (i.force == false) continue;
					if (map[i.pos.x][i.pos.y].t != i.data.t)
						map[i.pos.x][i.pos.y] = deepcopy(i.data);
				}
				player = deepcopy(data.player);
				let prevVersion = player.version, thisVersion = getStartPlayer().version;
				deepSaveParse(player, getStartPlayer());
				deepDecimalise(player);
				fixBuildings();
				if (player.pos.x > mapWidth) player.pos.x = mapWidth - 1;
				if (player.pos.y > mapHeight) player.pos.y = mapHeight - 1;
				if (prevVersion !== thisVersion) {
					fixOldSave(prevVersion);
					player.version = thisVersion;
				}
				player.time.offline += (Date.now() - player.time.thisTick)/1000;
				player.time.offline = Math.min(player.time.offline, 86400);
			}
			loadAfterPlayerLoad(testTime);
		}
		
		db.onerror = function(event) {
			console.error("Database error: " + event.target.errorCode);
		};
	};
}
function loadAfterPlayerLoad(testTime) {
	loadVue();
	Building.load();
	Research.load();


	let lastTick = Date.now();
	interval = setInterval(() => {
		thisTick = Date.now();
		gameLoop((Date.now() - lastTick)/1000);
		lastTick = Date.now();
	}, 25);
	renderInterval = setInterval(() => {
		if (paused) return;
		renderLoop();
	}, 50);
	setInterval(() => {if (player.options.autosave && !paused) save()}, 20000);
	loadCanvas();
	loadControls();
	need0update = true;
	need1update = true;
	need2update = true;
	renderAll();
	console.log((Date.now() - testTime) + "ms to load game");
}

function reset() {
	indexedDB.deleteDatabase(saveKey);
	location.reload();
}


function save() {
	if (player.time.lastSave + 1000 > Date.now()) return;
	player.time.lastSave = Date.now();
	Notifier.notify("Saving...");
	let transaction = db.transaction(["data"], "readwrite");
	transaction.objectStore("data").delete("1");
	transaction = db.transaction(["data"], "readwrite");
	transaction.onerror = function() {
		Notifier.error("Could Not Save.");
	};
	let objectStore = transaction.objectStore("data");
	let objectStoreRequest = objectStore.add({player, map, id: "1"});
	objectStoreRequest.onsuccess = function(event) {
		Notifier.success("Saved Game.");
	}
}

const separator = "||||||||||-||||||||||";
function exportSave() {
	request = indexedDB.open(saveKey, 1);
	request.onerror = function(event) {
		Notifier.error("Error in exporting.");
	};
	let expdata = "";
	request.onsuccess = function(event) {
		db = request.result;

		let transaction = db.transaction("data");
		transaction.objectStore("data").get("1").onsuccess = function(event) {
			let data = event.target.result;
			if (!data) {
				Notifier.error("Error in exporting.");
				return;
			}
			expdata = JSON.stringify(data.player);
			expdata += separator;
			expdata += JSON.stringify(data.map);
			expdata = btoa(expdata);
			let file = new Blob([expdata], {type: "text/plain"});
			if (window.navigator.msSaveOrOpenBlob) // IE10+
				window.navigator.msSaveOrOpenBlob(file, `Project Iridium Save (${new Date().toUTCString()}).txt`);
			else { // Others
				let a = document.createElement("a"),
					url = URL.createObjectURL(file);
				a.href = url;
				a.download = `Project Iridium Save (${new Date().toUTCString()}).txt`;
				document.body.appendChild(a);
				a.click();
				setTimeout(function() {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);  
				}, 0); 
			}
		}
		
		db.onerror = function(event) {
			Notifier.error("Error in exporting.");
			console.error("Database error: " + event.target.errorCode);
		};
	};
}
function importSave(data) {
	try {
		data = atob(data);
		data = data.split(separator).map(_ => JSON.parse(_));
		if (data[0].saveKey != saveKey) {
			Notifier.error("Invalid save format.");
			return;
		}
		let transaction = db.transaction(["data"], "readwrite");
		transaction.objectStore("data").delete("1");
		transaction = db.transaction(["data"], "readwrite");
		transaction.onerror = function() {
			Notifier.error("Could Not Save.");
		};
		let objectStore = transaction.objectStore("data");
		let objectStoreRequest = objectStore.add({player: data[0], map: data[1], id: "1"});
		objectStoreRequest.onsuccess = function(event) {
			location.reload();
		}
	} catch {
		Notifier.error("Invalid save format.")
	}
}

let paused = false;