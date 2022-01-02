if (!window.indexedDB) {
	Notifier.notify("Browser does not support indexedDB.");
	throw "No indexedDB";
}

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
			map = deepcopy(data.map);
			decimaliseArray(map, struct.map);
			if (map.length < mapWidth) {
				while (map.length < mapWidth) {
					let x = [];
					for (let i = 0; i < mapHeight; i++) {
						x.push({t: 0});
					}
					map.push(x);
				}
			}
			if (map[0].length < mapHeight) {
				while (map[0].length < mapHeight) {
					for (let i = 0; i < mapWidth; i++) {
						map[i][map[0].length] = {t: 0};
					}
				}
			}
			for (let i of SPECIAL_TILES) {
				map[i.pos.x][i.pos.y] = deepcopy(i.data);
			}
			player = deepcopy(data.player);
			deepSaveParse(player, getStartPlayer());
			deepDecimalise(player);
			loadVue();
			Building.load();

			let lastTick = Date.now();
			interval = setInterval(() => {
				thisTick = Date.now();
				gameLoop((Date.now() - lastTick)/1000);
				lastTick = Date.now();
			}, 25);
			renderInterval = setInterval(() => {
				if (paused) return;
				renderLoop();
			}, 125);
			setInterval(() => {if (player.options.autosave && !paused) save()}, 20000);
			loadCanvas();
			loadControls();
			need0update = true;
			need1update = true;
			need2update = true;
			renderAll();
			console.log((Date.now() - testTime) + "ms to load game");

			if (!player.unlocks.start) {
				Modal.show({
					title: "Time Game",
					text: `<div style="margin: 30px;">I'm too lazy to make lore</div>`,
					buttons: [{
						text: "Next",
						onClick() {
							Modal.closeFunc();
						}
					}],
					close() {
						player.unlocks.start = true;
						Modal.close();
					}
				})
			}
		}
		
		db.onerror = function(event) {
			console.error("Database error: " + event.target.errorCode);
		};
	};
}

function reset() {
	indexedDB.deleteDatabase(saveKey);
	location.reload();
}


function save() {
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

let paused = false;