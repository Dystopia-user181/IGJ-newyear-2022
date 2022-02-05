const LAB = {
	buildingData: {
		name: "Laboratory",
		desc: `Produces ${Currency.science.text} 0.05/real time second.`,

		get cost() {
			if (costAmt(7) < 1) return D(1e4);
			return D(Infinity);
		},
		currencyName: "iridite",
		buildTime: D(345600000),

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		get canBuild() {
			return player.base.newBuildings > 2;
		},
		startMeta(x, y) { return {}},
		
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let base = D(0.05);
			return base;
		},
		get researchBoost() {
			let base = Currency.science.amt.add(1).cbrt();
			return base;
		}
	}
}