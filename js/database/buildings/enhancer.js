const ENHANCER = {
	buildingData: {
		get name() { return player.base.newBuildings > 0 ? "Enhancer" : "???" },
		get desc() {
			return `Increases efficiency of
			${(Research.has("rep3") || Research.has("rep4")) ? `${Research.has("rep4") ? "iridite drills " : ""}${(Research.has("rep3") && Research.has("rep4")) ? "and " : ""}${Research.has("rep3") ? "energizers " : ""}`
			: `gold mines${player.base.enhanceCollectors ? " and essence collectors" : ""}`} in a 3x3 area.<br>Does not stack.`;
		},
		
		get cost() {
			if (player.base.newBuildings < 1) return D(Infinity);
			if (costAmt(4) > 9)
				return Decimal.pow(5, costAmt(4)).mul(2)
			return D(Math.pow(costAmt(4)*0.6 + 1, 3)).mul(3).floor();
		},
		currencyName: "essence",
		buildTime: D(20),

		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		get canBuild() {
			return player.base.newBuildings > 0;
		},
		startMeta(x, y) { return {} }
	}
}