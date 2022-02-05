const ANTIPOINT = {
	buildingData: {
		get name() {
			if (player.base.newBuildings < 2) return "???";
			return "Antipoint";
		},
		get desc() {
			if (player.base.newBuildings < 2) return "???";
			return `Reverses time and gives buffs in return.<br>Do not place them within 6 tiles of each other.`;
		},

		get cost() {
			if (costAmt(5) > 3) return D(Infinity);
			return Decimal.pow(30, Math.pow(costAmt(5), 1.5)).mul(4e6);
		},
		currencyName: "essence",
		buildTime: D(1800),

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		get canBuild() {
			return player.base.newBuildings > 1;
		},
		startMeta(x, y) { return {} },
		
		getEffect(x, y) {
			let base = D(1);
			let nearby = 0;
			for (i of buildingList(5)) {
				if (distance([i.pos.x, i.pos.y], [x, y]) < 6.5)
					nearby++;
			}
			base = base.div(Math.sqrt(nearby));
			return base;
		}
	}
}