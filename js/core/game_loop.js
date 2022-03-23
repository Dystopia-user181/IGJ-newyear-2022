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
	player.time.thisTick = Date.now();
	if (paused) return;
	d = Math.min(d, (player.obelisk.repairing || player.timewall.two.destroying) ? 0.1 : 10);
	player.time.timeStat += d;
	let trueDiff = d;

	if (player.time.drainOffline && player.time.offline > 0) {
		player.time.velocity = Math.min(player.time.velocity + 0.025, 8);
		player.time.offline -= player.time.velocity*2.5*d;
		if (player.time.offline < 0) {
			player.time.offline = 0;
			player.time.drainOffline = false;
		}
	} else {
		player.time.velocity = Math.max(player.time.velocity - 0.025, 1);
	}

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

	if (Research.has("acv1")) {
		tmp.iridite.timespeed = D(1);
		for (let i of buildingList(6)) {
			tmp.iridite.timespeed = tmp.iridite.timespeed.add(BD[6].timespeed(i.pos.x, i.pos.y));
		}
	} else {
		tmp.iridite.timespeed = D(1);
	}

	d = timerate().mul(d);

	for (let i of buildingList(1)) {
		i.time = i.time.add(d).max(0);
		if (i.time.gte(BUILDINGS[i.meta.building].buildTime)) {
			i.time = D(0);
			i.t = i.meta.building;
			mfb(i).t = i.meta.building;
			buildingListList.get(i.meta.building)?.push(i);
			buildingListList.delete(1);
			i.meta = BUILDINGS[i.meta.building].startMeta(i.pos.x, i.pos.y);
			if (Modal.data.bind == "constructing-menu")
				Modal.close();
			canvas.need0update = true;
			canvas.need1update = true;
			updateTileUsage();
		}
	}
	for (let i of player.buildings) {
		if (!i.upgrading) continue;
		i.time = i.time.add(d).max(0);
		if (i.time.gte(BUILDINGS[i.t].levelTime(i.level))) {
			i.time = D(0);
			i.level++;
			i.upgrading = false;
			canvas.need0update = true;
			canvas.need1update = true;
		}
	}
	if (player.timewall.one.destroying) {
		player.timewall.one.time = player.timewall.one.time.add(d).max(0);
		if (player.timewall.one.time.gte(80)) {
			player.timewall.one.destroyed = true;
			player.timewall.one.destroying = false;
			for (let i = 0; i < 9; i++) {
				map[8][i].data.forceWalkable = true;
				map[i][8].data.forceWalkable = true;
			}
			if (Modal.data.bind == "wall1-menu") {
				Modal.close();
			}
			canvas.need0update = true;
			updateTileUsage();
		}
	}
	if (player.timewall.two.destroying) {
		player.timewall.two.time = player.timewall.two.time.add(d).max(0);
		if (player.timewall.two.time.gte(2592000)) {
			player.timewall.two.destroyed = true;
			player.timewall.two.destroying = false;
			for (let i = 0; i < 17; i++) {
				map[16][i].data.forceWalkable = true;
				map[i][16].data.forceWalkable = true;
			}
			if (Modal.data.bind == "wall2-menu") {
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
		tmp.obelisk.activeTime = Obelisk.activeTime;
		tmp.obelisk.cooldownTime = Obelisk.cooldownTime;
		tmp.obelisk.effect = Obelisk.power;
		if (!player.obelisk.activeTime.gt(0)) {
			player.obelisk.cooldownTime = player.obelisk.cooldownTime.add(trueDiff).min(tmp.obelisk.cooldownTime);
			if (player.auto.obelisk.on && player.obelisk.cooldownTime.gte(tmp.obelisk.cooldownTime)) {
				Obelisk.activate();
			}
		} else {
			player.obelisk.activeTime = player.obelisk.activeTime.add(trueDiff);
			if (player.obelisk.activeTime.gte(tmp.obelisk.activeTime)) {
				player.obelisk.activeTime = D(0);
				player.obelisk.cooldownTime = D(0);
				canvas.need0update = true;
			}
		}
	}
	let prevMoney = Currency.money.amt;
	let prevEssence = Currency.essence.amt;
	let prevIridite = player.iridite.researching ? player.iridite.researches[player.iridite.researching] : Currency.iridite.amt;
	let prevScience = Currency.science.amt;
	let prodMoney = D(0), prodEssence = D(0), prodIridite = D(0);
	for (let i of buildingList(2)) {
		if (!i.upgrading)
			prodMoney = prodMoney.add(BD[2].getProduction(i.pos.x, i.pos.y))
	}
	for (let i of buildingList(3)) {
		if (!i.upgrading)
			prodEssence = prodEssence.add(BD[3].getProduction(i.pos.x, i.pos.y))
	}
	for (let b of buildingList(6)) {
		for (let i in DEPTHS.slice(0, b.meta.depth + 1)) {
			let d = DEPTHS[i];
			if (Depth.canAccess(b, i))
				for (let o in d.ores) {
					Items.insertToInventory(o, d.ores[o].mul(trueDiff), b.meta.inventory);
				}
		}
		if (!b.upgrading) {
			let prod = BD[6].getProduction(b.pos.x, b.pos.y);
			if (b.meta.charging) {
				b.meta.charge = b.meta.charge.add(prod[2].mul(RS.septuplerII.effect).mul(d));
				if (b.meta.charge.lt(0)) {
					b.meta.charge = D(0);
					player.anti.drain = "none";
				}
				if (Research.has("acv1")) {
					let prevSpeed = b.meta.timespeed;
					if (b.meta.timespeed.lt(9) || b.level > 0)
						b.meta.timespeed = b.meta.timespeed.pow(RS.acv2.effect).add(d.mul(2e-7)).max(0).pow(1/RS.acv2.effect).min(i.level > 0 ? 250 : 10);
					else
						b.meta.timespeed = b.meta.timespeed.pow(b.meta.timespeed.mul(RS.acv2.effect/9)).add(d.mul(2e-7)).max(0).pow(i.meta.timespeed.mul(RS.acv2.effect/9).recip()).min(100);
					if (prevSpeed.gt(0) && b.meta.timespeed.lte(0))
						player.anti.drain = "none";
				}
			} else {
				prodMoney = prodMoney.add(prod[0]);
				prodEssence = prodEssence.add(prod[1]);
				prodIridite = prodIridite.add(prod[2]);
				if (Research.has("acv1"))
					if (b.meta.timespeed.gte(10))
						b.meta.timespeed = b.meta.timespeed.pow(Decimal.pow(Research.has("acv2") ? 0.85 : 0.9, trueDiff)).max(0);
					else
						b.meta.timespeed = b.meta.timespeed.sub(trueDiff*(0.4 + 0.2*Research.has("acv2"))).max(0);
			}
		}
	}
	for (let i of buildingList(7)) {
		if (!i.upgrading) {
			let prod = BD[7].getProduction(i.pos.x, i.pos.y);
			Currency.science.add(prod.mul(trueDiff));
			SmeltHandler.smelt(i.meta.smelting, trueDiff);
		}
	}
	for (let i of buildingList(8)) {
		if (!(i.upgrading || i.meta.paused)) {
			let b6List = [];
			i.meta.time = i.meta.time.add(BD[8].getProduction(i.pos.x, i.pos.y).mul(trueDiff));
			if (i.meta.time.gte(1)) {
				for (let j = 0; j < 4; j++) {
					let pos = getXYfromDir(j, [i.pos.x, i.pos.y]);
					if (map[pos[0]][pos[1]].t != 6) continue;
					let b = Building.getByPos(...pos);
					if (!b.upgrading && (!i.meta.charging || b.level > 0)) {
						b6List.push(Building.getByPos(...pos));
					}
				}
				for (let j = 0; j < 4; j++) {
					let pos = getXYfromDir(j, [i.pos.x, i.pos.y]);
					if (map[pos[0]][pos[1]].t != 9) continue;
					let b = Building.getByPos(...pos);
					if (!b.upgrading) {
						if (!b.meta.charge) b.meta.charge = D(0);
						if (b.meta.charge.lt(1))
							canvas.need0update = true;
						b.meta.charge = b.meta.charge.add(i.meta.time.floor().mul(0.2)).min(Research.has("orb1") ? 5 : 1);
						if (b.meta.charge.gte(1) && Research.has("auto1")) {
							let enhancers = 0;
							let {x, y} = b.pos;
							for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
								for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
									if (map[i][j].t == 4) {
										enhancers++;
									}
								}
							}
							enhancers = Math.min(enhancers, 0 + Research.has("rep3"));
							Currency.orbs.add(b.meta.charge.floor().mul(1 + 3*enhancers));
							b.meta.charge = b.meta.charge.sub(b.meta.charge.floor());
						}
					}
				}
				for (let ir of b6List) {
					if (i.meta.charging)
						ir.meta.timespeed = ir.meta.timespeed.pow(2).add(BD[8].getEffect2(i.pos.x, i.pos.y).mul(i.level > 1 ? d.mul(2e-7) : 1).div(b6List.length).mul(i.meta.time.floor())).pow(0.5).min(250);
					else
						ir.meta.charge = ir.meta.charge.add(BD[8].getEffect(i.pos.x, i.pos.y).div(b6List.length).mul(i.meta.time.floor()));
				}
				i.meta.time = i.meta.time.sub(i.meta.time.floor());
			}
		}
	}
	if (tmp.anti.drainMoney) {
		let amt = prodMoney.mul(0.001).sub(Currency.money.amt.mul(drainConst.pow(0.001).sub(1)))
		.mul(drainConst.pow(0.001).sub(1).recip().mul(
			Decimal.sub(1, drainConst.pow(0.001).recip().pow(d * 1000))
		));
		
		Currency.money.add(amt);
		player.anti.money = player.anti.money.add(prodMoney.mul(d).sub(amt));
	} else  {
		if (Research.has("idl2")) {
			player.anti.money = player.anti.money.add(Currency.money.amt.mul(d).mul(1 - 1/drainConst));
			if (player.anti.money.lt(0)) {
				player.anti.money = D(0);
				player.anti.drain = "none";
			}
		}
		Currency.money.add(prodMoney.mul(d));
	}
	if (tmp.anti.drainEssence) {
		let amt = prodEssence.mul(0.001).sub(Currency.essence.amt.mul(drainConst.pow(0.001).sub(1)))
		.mul(drainConst.pow(0.001).sub(1).recip().mul(
			Decimal.sub(1, drainConst.pow(0.001).recip().pow(d * 1000))
		));
		
		Currency.essence.add(amt);
		player.anti.essence = player.anti.essence.add(prodEssence.mul(d).sub(amt));
	} else {
		if (Research.has("idl2")) {
			player.anti.essence = player.anti.essence.add(Currency.essence.amt.mul(d).mul(1 - 1/drainConst));
			if (player.anti.essence.lt(0)) {
				player.anti.essence = D(0);
				player.anti.drain = "none";
			}
		}
		Currency.essence.add(prodEssence.mul(d));
	}
	if (player.iridite.researching)
		Research.update(d, prodIridite);
	else
		Currency.iridite.add(prodIridite.mul(d));
	if (tmp.anti.drainTime) {
		if (Currency.essence.amt.lt(0) || Currency.money.amt.lt(0) || Currency.iridite.amt.lt(0)) {
			Currency.money.amt = Currency.money.amt.max(0);
			Currency.essence.amt = Currency.essence.amt.max(0);
			Currency.iridite.amt = Currency.iridite.amt.max(0);
			player.anti.drain = "none";
		} else if (player.anti.drain == "time") {
			player.anti.time = player.anti.time.add(d.mul(-1));
		}
	} else if (Research.has("idl1")) {
		player.anti.time = player.anti.time.add(d.mul(0.3));
	}
	tmp.moneyGain = Currency.money.amt.sub(prevMoney).div(player.options.gameTimeProd ? d : trueDiff);
	tmp.essenceGain = Currency.essence.amt.sub(prevEssence).div(player.options.gameTimeProd ? d : trueDiff);
	tmp.iriditeGain = (player.iridite.researching ? player.iridite.researches[player.iridite.researching] : Currency.iridite.amt).sub(prevIridite).div(player.options.gameTimeProd ? d : trueDiff);
	tmp.scienceGain = Currency.science.amt.sub(prevScience).div(trueDiff);

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
	renderLayer2();
}

let interval, autoInterval, renderInterval;

let tmp = {
	hasAnti: false,
	moneyGain: D(0),
	essenceGain: D(0),
	iriditeGain: D(0),
	scienceGain: D(0),
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
	},
	iridite: {
		timespeed: D(0)
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
	base = base.mul(RS.doublerII.effect).mul(RS.doublerIII.effect);

	base = base.mul(tmp.iridite.timespeed);

	if (player.timewall.two.destroying) {
		base = base.sub(player.timewall.two.time.mul(0.15)).max(0);
	}
	if (player.time.drainOffline && player.time.offline > 0) base = base.mul(player.time.velocity);
	if (tmp.anti.drainTime) base = base.mul(-10);
	return base;
}
function scaleTimeDisp(x) {
	return x.mul(player.options.gameTimeProd ? 1 : timerate());
}