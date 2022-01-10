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
	d = Math.min(d, player.obelisk.repairing ? 0.2 : 10);
	player.time.timeStat += d;
	player.time.thisTick = Date.now();
	let trueDiff = d;

	tmp.hasAnti = buildingAmt(5) > 0;

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
		if (player.obelisk.repaired) {
			tmp.obelisk.activeTime = getActiveTime();
			tmp.obelisk.cooldownTime = getCooldownTime();
			tmp.obelisk.effect = getObeliskEffect();
			if (!player.obelisk.activeTime.gt(0)) {
				player.obelisk.cooldownTime = player.obelisk.cooldownTime.add(trueDiff).min(tmp.obelisk.cooldownTime);
			} else {
				player.obelisk.activeTime = player.obelisk.activeTime.add(trueDiff);
				if (player.obelisk.activeTime.gte(tmp.obelisk.activeTime)) {
					player.obelisk.activeTime = D(0);
					player.obelisk.cooldownTime = D(0);
				}
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
		if (tmp.hasAnti) {
			if (player.anti.drain == "money") {
				let prevprevMoney = Currency.money.amt;
				Currency.money.amt = Currency.money.mul(Decimal.pow(0.995, d));
				player.anti.money = player.anti.money.add(prevprevMoney.sub(Currency.money.amt));
			} else if (player.anti.drain == "essence") {
				let prevprevEssence = Currency.essence.amt;
				Currency.essence.amt = Currency.essence.mul(Decimal.pow(0.995, d));
				player.anti.essence = player.anti.essence.add(prevprevEssence.sub(Currency.essence.amt));
			} else if (player.anti.drain == "time") {
				if (Currency.essence.amt.lte(0))
			}
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
	hasAnti: false,
	moneyGain: D(0),
	essenceGain: D(0),
	obelisk: {
		activeTime: D(0),
		cooldownTime: D(0),
		effect: D(1)
	}
}

function timerate() {
	let base = D(1);
	if (player.obelisk.repairing) {
		base = base.div(Decimal.pow(2, player.obelisk.time));
	}
	if (player.obelisk.activeTime.gt(0)){
		base = base.mul(tmp.obelisk.effect);
	}
	return base;
}