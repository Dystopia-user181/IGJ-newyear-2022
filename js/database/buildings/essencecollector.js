const ESSENCECOLLECTOR = {
	buildingData: {
		get name() { return player.base.newBuildings > 0 ? "Essence Collector" : "???" },
		desc: "Produces <span class='essence'>*</span> 0.05/s.",

		get cost() {
			if (costAmt(3) >= 48 || player.iridite.newBuildings || player.base.newBuildings < 1) return D(Infinity);
			return Decimal.pow(1.5, Math.pow(costAmt(3), 1.2)).mul(800).floor();
		},
		currencyName: "money",
		buildTime: D(15),

		levelCost(lvl) {
			if (lvl > 4 || player.base.newBuildings < 1) return D(Infinity);

			return Decimal.pow(40, Math.pow(lvl, 1.2)).mul(5e5 + 9.5e6*(lvl > 2));
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(10);

			return Decimal.pow(4, lvl).mul(2.25 + 12*(lvl > 2) + 120*(lvl > 3));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(30);
			if (lvl == 1) return D(90);
			if (lvl == 2) return D(7200);
			if (lvl == 3) return D(172800);
			if (lvl == 4) return D(3456000);
		},

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		get canBuild() {
			return player.base.newBuildings > 0;
		},
		startMeta(x, y) { return {} },
		
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let enhancers = 0;
			if (player.base.enhanceCollectors)
				for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
					for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
						if (map[i][j].t == 4) {
							enhancers++;
						}
					}
				}
			enhancers = Math.min(enhancers, 1);
			return BD[3].levelScaling(b.level).mul(0.05*(1 + enhancers*3)).mul(tmp.anti.moneyEffect);
		}
	}
}