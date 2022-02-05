const ENERGIZER = {
	buildingData: {
		name: "Energizer",
		desc: `Creates ${Currency.orbs.text} when activated by a charger.`,

		get cost() {
			return Decimal.pow(1e8, Math.pow(costAmt(9), 1.8)).mul(1e46);
		},
		currencyName: "money",
		buildTime: D(1.728e12),
		
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		canBuild: true,
		startMeta(x, y) { return {
			charge: D(0)
		}}
	}
}