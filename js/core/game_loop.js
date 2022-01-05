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
	d = Math.min(d, player.obelisk.reparing ? 0.2 : 10);
	player.time.timeStat += d;
	player.time.thisTick = Date.now();
	let trueDiff = d;

	d = timerate().mul(d);

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
		if (player.timewall.one.destroying) {
			player.timewall.one.time = player.timewall.one.time.add(d);
			if (player.timewall.one.time.gte(80)) {
				player.timewall.one.destroyed = true;
				player.timewall.one.destroying = false;
				for (let i = 0; i < 49; i++) {
					map[48][i].data.forceWalkable = true;
					map[i][48].data.forceWalkable = true;
				}
				if (Modal.data.bind = "wall1-menu") {
					Modal.close();
				}
				canvas.need0update = true;
				updateTileUsage();
			}
		}
		if (player.obelisk.repairing) {
			player.obelisk.time = player.obelisk.time.add(d);
			canvas.need2update = true;
			if (player.obelisk.time.gte(6)) {
				player.obelisk.repaired = true;
				player.obelisk.repairing = false;
			}
		}
		let prevMoney = Currency.money.amt;
		let prevEssence = Currency.essence.amt;
		for (let i of buildingList(2)) {
			if (!i.upgrading)
				Currency.money.add(BD[2].getProduction(i.pos.x, i.pos.y).mul(d));
		}
		for (let i of buildingList(3)) {
			if (!i.upgrading)
				Currency.essence.add(BD[3].getProduction(i.pos.x, i.pos.y).mul(d));
		}
		tmp.moneyGain = Currency.money.amt.sub(prevMoney).div(d);
		tmp.essenceGain = Currency.essence.amt.sub(prevEssence).div(d);
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

function timerate() {
	let base = D(1);
	if (player.obelisk.repairing) {
		base = base.div(Decimal.pow(2, player.obelisk.time));
	}
	return base;
}