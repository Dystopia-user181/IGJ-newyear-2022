function load() {
	setTimeout(function() {
		let testTime = Date.now();
		loadMap();
		loadPlayer();
		loadVue();
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
		console.log((Date.now() - testTime) + "ms to load game");

		/*if (!player.unlocks.start) {
			Modal.show({
				title: "The beginning of the end.",
				text: `<div style="margin: 30px;">Thousands of years have passed, and the conditions on Earth are deteriorating.<br><br>
					Almost all the resources have run out, and it was projected that we would be completely devoid of new resources in 5 years.
				</div>`,
				buttons: [{
					text: "Next",
					onClick() {
						Modal.closeFunc();
					}
				}],
				close() {
					Modal.show({
						title: "The beginning of the end.",
						text: `<div style="margin: 30px;">It was too late to save Earth, so many missions to space were planned.<br>
							You were tasked to explore this new planet, named Cassiopeia, and set up a new civilisation.<br><br>
							Rather unfortunately, this turned out to be a bare planet, with only sparse bits of useful resources scattered in between.
							<br><br>
							Best of luck surviving.
						</div>`,
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
			})
		}*/
	}, 100);
}

function reset() {
	localStorage.setItem(saveKey, JSON.stringify(getStartPlayer()));
	localStorage.removeItem(saveKey + 'map');
	location.reload();
}


function save() {
	if (!window.indexedDB) {
		Notifier.notify("Browser does not support indexedDB.");
		return;
	}
	Notifier.notify("Saving...");
	try {
		localStorage.setItem(saveKey, JSON.stringify(player));
		let request = indexedDB.open(saveKey + "map", 1);
		let db;
		request.onerror = function(event) {
			Notifier.notify("Could not access indexedDB when saving.");
		};
		request.onsuccess = function(event) {
			// Do something with request.result!
			db = request.result;
			let trans = db.transaction(["map"], "readwrite");

			Notifier.notify("Saved Game.");
		};
	} catch {
		localStorage.removeItem(saveKey);
		Notifier.notify("SAVE FAILED: NOT ENOUGH SPACE")
	}
}

let paused = false;