function Updater(func) {
	this.id = Updater.length;
	Updater.updates.push({
		func,
		running: true
	});
	this.updater = Updater.updates[this.id];
}
Updater.updates = [];

function gameLoop(d) {
	if (paused) return;
	d = Math.min(d, 10);
	player.time.timeStat += d;
	player.time.thisTick = Date.now();
	let trueDiff = d;

	if (player.unlocks.start) {
		for (let i of buildingList(1)) {
			i.time = i.time.add(d);
			if (i.time.gte(BUILDINGS[i.meta.building].buildTime)) {
				i.time = D(0);
				i.t = i.meta.building;
				mfb(i).t = i.meta.building;
				i.meta = BUILDINGS[i.meta.building].startMeta(i.pos.x, i.pos.y);
				if (Modal.data.bind == "constructing-menu")
					Modal.close();
				canvas.need0update = true;
				updateTileUsage();
			}
		}
		for (let i of buildingList(2)) {
			Currency.money.amt = Currency.money.amt.add(d);
		}
	}

	for (let i in Updater.updates) {
		let obj = Updater.updates[i];
		if (obj.running) obj.func(d);
	}
}
function renderLoop() {
	if (canvas.need0update) {
		render();
		canvas.need0update = false;
	}
	if (canvas.need1update) {
		renderLayer1();
		canvas.need1update = false;
	}
	if (canvas.need2update) {
		renderLayer2();
		canvas.need2update = false;
	}
}

let interval, autoInterval, renderInterval;

let tmp = {
	shardGain: D(0)
}