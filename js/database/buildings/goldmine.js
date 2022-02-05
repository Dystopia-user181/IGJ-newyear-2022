const GOLDMINE = {
	buildingData: {
		name: "Gold Mine",
		desc: "Produces <span class='money'>$</span> 1.00/s.",

		get cost() {
			if (costAmt(2) >= 96 || player.iridite.newBuildings) {
				return D(Infinity);
			}
			if (player.base.lowerMineCost) {
				if (costAmt(2) >= 64) return Decimal.pow(1.3, Math.pow(costAmt(2), 1.2) - 147).mul(1e8).floor()
				return Decimal.pow(costAmt(2), 3.5).floor();
			}
			return Decimal.pow(1.5, Math.pow(costAmt(2), 1.2)).mul(10).floor();
		},
		currencyName: "money",
		buildTime: D(5),

		levelCost(lvl) {
			if (lvl > 7) return D(Infinity);

			return Decimal.pow(10, Math.pow(lvl, (lvl > 6) ? 1.21 : 1.19855)).mul(100 + 100*(lvl > 4) + 3e4*(lvl > 5)).floor();
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(5);

			return Decimal.pow(3 + Math.max(Math.min(lvl - 3, lvl/2 - 1), 0), lvl).mul(2 + 18*(lvl > 4));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(15);
			if (lvl == 1) return D(30);
			if (lvl == 2) return D(60);
			if (lvl == 3) return D(120);
			if (lvl == 4) return D(1200);
			if (lvl == 5) return D(7200);
			if (lvl == 6) return D(172800);
			if (lvl == 7) return D(3456000);
		},

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		canBuild: true,
		startMeta(x, y) { return {} },

		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let enhancers = 0;
			for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
				for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
					if (map[i][j].t == 4) {
						enhancers++;
					}
				}
			}
			enhancers = Math.min(enhancers, 1);
			return BD[2].levelScaling(b.level).mul(1*(1 + enhancers*3)).mul(tmp.anti.essenceEffect);
		}
	}
}