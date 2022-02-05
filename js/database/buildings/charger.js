const CHARGER = {
	buildingData: {
		name: "Charger",
		desc: `Distributes charge to all laterally adjacent iridite drills.`,

		get cost() {
			return Decimal.pow(1e5, Math.pow(costAmt(8), 1.3)).mul(6e35);
		},
		currencyName: "essence",
		buildTime: D(1.728e10),

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		canBuild: true,
		startMeta(x, y) { return {
			time: D(0),
			charging: false,
			paused: false
		}},

		levelCost(lvl) {
			if (lvl == 0) return D(3.9e39);
			if (lvl == 1) return D(4.9e49)
			else return D(Infinity);
		},
		levelScaling(lvl) {
			return Decimal.pow(100, Math.pow(lvl, 0.95));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(3.456e11);
			if (lvl == 1) return D(1.728e13);
			if (lvl == 2) return D(1e1000);
		},
		
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			return D(b.level > 0 ? 0.1 : 1/15);
		},
		getEffect(x, y) {
			let b = Building.getByPos(x, y);
			return BD[8].levelScaling(b.level).mul(5e9);
		},
		getEffect2(x, y) {
			let b = Building.getByPos(x, y);
			return b.level > 1 ? D(5) : D(1024);
		}
	}
}