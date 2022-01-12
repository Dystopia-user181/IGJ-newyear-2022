function getActiveTime() {
	let base = D(10);
	base = base.mul(Decimal.pow(1.3, player.obelisk.upgs.active));
	return base;
}
function getCooldownTime() {
	let base = D(120);
	base = base.mul(Decimal.pow(0.8, player.obelisk.upgs.cooldown));
	return base;
}
function getObeliskEffect() {
	let base = D(5);
	base = base.mul(Decimal.pow(1.3, player.obelisk.upgs.power));
	return base;
}

const Obelisk = {
	activeUpgCost() {
		let base = Decimal.pow(2.3, Math.pow(player.obelisk.upgs.active, 1.2)).mul(100).ceil();
		return base;
	},
	buyActiveUpg() {
		if (Currency.essence.amt.lt(Obelisk.activeUpgCost()) || player.obelisk.upgs.active >= 30) return;
		Currency.essence.use(Obelisk.activeUpgCost());
		player.obelisk.upgs.active++;
	},
	cooldownUpgCost() {
		let base = Decimal.pow(2.8, Math.pow(player.obelisk.upgs.cooldown, 1.2)).mul(150).ceil();
		return base;
	},
	buyCooldownUpg() {
		if (Currency.essence.amt.lt(Obelisk.cooldownUpgCost()) || player.obelisk.upgs.cooldown >= 30) return;
		Currency.essence.use(Obelisk.cooldownUpgCost());
		player.obelisk.upgs.cooldown++;
	},
	powerUpgCost() {
		let base = Decimal.pow(2, Math.pow(player.obelisk.upgs.power, 1.2)).mul(200).ceil();
		return base;
	},
	buyPowerUpg() {
		if (Currency.essence.amt.lt(Obelisk.powerUpgCost()) || player.obelisk.upgs.power >= 30) return;
		Currency.essence.use(Obelisk.powerUpgCost());
		player.obelisk.upgs.power++;
	}
}