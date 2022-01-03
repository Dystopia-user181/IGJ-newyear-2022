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
		for (let i of player.buildings) {
			if (!i.upgrading) continue;
			i.time = i.time.add(d);
			if (i.time.gte(BUILDINGS[i.t].levelTime(i.level))) {
				i.time = D(0);
				i.level++;
				i.upgrading = false;
				canvas.need0update = true;
			}
		}
		let prevMoney = Currency.money.amt;
		for (let i of buildingList(2)) {
			if (!i.upgrading)
				Currency.money.amt = Currency.money.amt.add(BD[2].levelScaling(i.level).mul(0.5).mul(d));
		}
		tmp.moneyGain = Currency.money.amt.sub(prevMoney).div(d);
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
	moneyGain: D(0)
}