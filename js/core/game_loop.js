function Updater(func) {
	this.id = Updater.length;
	Updater.updates.push({
		func,
		running: true
	});
	this.updater = Updater.updates[this.id];
}
Updater.updates = [];

const drainConst = D(1/0.997);
function gameLoop(d) {
	if (paused) return;
	d = Math.min(d, player.obelisk.repairing ? 0.2 : 10);
	player.time.timeStat += d;
	player.time.thisTick = Date.now();
	let trueDiff = d;

	tmp.hasAnti = buildingAmt(5) > 0;
	tmp.anti.drainMoney = tmp.hasAnti && player.anti.drain == "money";
	tmp.anti.drainEssence = tmp.hasAnti && player.anti.drain == "essence";
	tmp.anti.drainTime = tmp.hasAnti && player.anti.drain == "time";

	tmp.anti.antisum = D(0);
	for (let i of buildingList(5)) {
		tmp.anti.antisum = tmp.anti.antisum.add(BD[5].getEffect(i.pos.x, i.pos.y));
	}

	tmp.anti.moneyEffect = player.anti.money.sqrt().div(3e4).add(1).sqrt().pow(tmp.anti.antisum.pow(0.3));
	tmp.anti.essenceEffect = player.anti.essence.sqrt().div(3e2).add(1).sqrt().pow(tmp.anti.antisum.pow(0.3));
	tmp.anti.timeEffect = player.anti.time.div(1000).mul(Decimal.pow(3, tmp.anti.antisum.pow(0.8))).add(1).pow(tmp.anti.antisum.pow(0.3).mul(0.2));

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
		let prodMoney = D(0), prodEssence = D(0);
		for (let i of buildingList(2)) {
			if (!i.upgrading)
				prodMoney = prodMoney.add(BD[2].getProduction(i.pos.x, i.pos.y))
		}
		for (let i of buildingList(3)) {
			if (!i.upgrading)
				prodEssence = prodEssence.add(BD[3].getProduction(i.pos.x, i.pos.y))
		}
		if (tmp.anti.drainMoney) {
			let amt = prodMoney.mul(0.001).sub(Currency.money.amt.mul(drainConst.pow(0.001).sub(1)))
			.mul(drainConst.pow(0.001).sub(1).recip().mul(
				Decimal.sub(1, drainConst.pow(0.001).recip().pow(d * 1000))
			));
			
			Currency.money.add(amt);
			player.anti.money = player.anti.money.add(prodMoney.mul(d).sub(amt));
		} else  {
			Currency.money.add(prodMoney.mul(d));
		}
		if (tmp.anti.drainEssence) {
			let amt = prodEssence.mul(0.001).sub(Currency.essence.amt.mul(drainConst.pow(0.001).sub(1)))
			.mul(drainConst.pow(0.001).sub(1).recip().mul(
				Decimal.sub(1, drainConst.pow(0.001).recip().pow(d * 1000))
			));
			
			Currency.essence.add(amt);
			player.anti.essence = player.anti.essence.add(prodEssence.mul(d).sub(amt));
		} else  {
			Currency.essence.add(prodEssence.mul(d));
		}
		if (tmp.anti.drainTime) {
			if (Currency.essence.amt.lte(0) || Currency.money.amt.lte(0)) {
				player.anti.drain = "none";
			} else {
				player.anti.time = player.anti.time.add(d.mul(-1));
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
	},
	anti: {
		drainMoney: false,
		drainEssence: false,
		drainTime: false,
		moneyEffect: D(0),
		essenceEffect: D(0),
		timeEffect: D(0),
		antisum: D(0)
	}
}

function timerate() {
	let base = D(1);
	if (player.obelisk.repairing) {
		base = base.div(Decimal.pow(2, player.obelisk.time));
	}
	if (player.obelisk.activeTime.gt(0)) {
		base = base.mul(tmp.obelisk.effect);
	}
	base = base.mul(tmp.anti.timeEffect);
	if (tmp.anti.drainTime) base = base.mul(-10);
	return base;
}