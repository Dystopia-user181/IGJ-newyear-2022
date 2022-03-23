const Crafting = {
	register(set, data) {
		if (!recipes[set])
			recipes[set] = [];
		recipes[set].push(data);
	},
	recipes: {},
	load() {
		Crafting.loadVue();
	},
	buy(data) {
		let costs = data.requireItems.map(item => ({
			type: item.type,
			rowsCols: Items.hasInInventory(item.type, item.amt)
		}))
		for ()
	}
}