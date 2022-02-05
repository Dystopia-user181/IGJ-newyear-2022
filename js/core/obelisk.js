const Obelisk = {
	get activeTime() {
		if (player.obelisk.upgs.timepercent >= 30) return D(Infinity);
		let base = D(10);
		base = base.add(10*player.obelisk.upgs.timepercent);
		return base;
	},
	get cooldownTime() {
		if (player.obelisk.upgs.timepercent >= 30) return D(0);
		let base = D(120);
		base = base.mul(Decimal.pow(0.85, player.obelisk.upgs.timepercent));
		return base;
	},
	get power() {
		let base = D(5);
		base = base.mul(Decimal.pow(1.3, player.obelisk.upgs.power));
		return base;
	},
	timepercentUpgCost() {
		let base = Decimal.pow(2.3, Math.pow(player.obelisk.upgs.timepercent, 1.2)).mul(150).ceil();
		return base;
	},
	buyTimepercentUpg() {
		if (Currency.essence.amt.lt(Obelisk.timepercentUpgCost()) || player.obelisk.upgs.timepercent >= 30) return;
		Currency.essence.use(Obelisk.timepercentUpgCost());
		player.obelisk.upgs.timepercent++;
	},
	powerUpgCost() {
		let base = Decimal.pow(2.1, Math.pow(player.obelisk.upgs.power, 1.2)).mul(100).ceil();
		return base;
	},
	buyPowerUpg() {
		if (Currency.essence.amt.lt(Obelisk.powerUpgCost()) || player.obelisk.upgs.power >= 30) return;
		Currency.essence.use(Obelisk.powerUpgCost());
		player.obelisk.upgs.power++;
	},

	activate() {
		if (Currency.essence.amt.lt(40) || player.obelisk.activeTime.gt(0) || player.obelisk.cooldownTime.lt(tmp.obelisk.cooldownTime)) return;
		Currency.essence.use(40);
		player.obelisk.activeTime = D(0.0001);
		player.obelisk.cooldownTime = D(0);
		canvas.need0update = true;
	}
}