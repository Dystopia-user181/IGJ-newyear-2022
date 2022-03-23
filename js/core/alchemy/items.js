class ItemState {
	constructor(data) {
		this._config = data;
		this.texture = "images/alchemy/" + data.name + ".png";
		this.canSmelt = false;
		this.isFuel = false;
		this.unstackable = Boolean(data.unstackable);
	}

	get displayName() {
		return this._config.displayName instanceof Function ? this._config.displayName() : this._config.displayName;
	}

	addSmeltingRecipe(data) {
		this.smeltingRecipe = new SmeltingRecipeState(data);
		this.canSmelt = true;
		return this.smeltingRecipe;
	}

	makeFuel(data) {
		this.isFuel = true;
		this.fuelData = new FuelState(data);
	}
}

const Items = {
	insertToInventory(type, x, inventory = player.alchemy.inventory) {
		x = D(x);
		if (x.lte(0)) return;

		let p = Items.freeSpaceInInventory(type, inventory);
		if (!p) return;
		inventory[p[0]][p[1]].type = type;
		inventory[p[0]][p[1]].amt = inventory[p[0]][p[1]].amt.add(x);
	},
	freeSpaceInInventory(type, inventory = player.alchemy.inventory) {
		let standby = false;
		let unstackable = Item(type).unstackable;
		for (let row in inventory) {
			for (let col in inventory[row]) {
				cell = inventory[row][col];
				// Has same item
				if (cell.type == type && cell.amt.gt(0) && !unstackable) {
					return [row, col];
				}
				// Doesn't have same item
				if (cell.amt.lte(0)) {
					standby = standby || [row, col];
					if (standby && unstackable)
						return standby;
				}
			}
		}
		return standby;
	},
	spendFromInventory(type, x, inventory = player.alchemy.inventory, rowsCols) {
		x = D(x);
		if (rowsCols == undefined) rowsCols = Items.hasInInventory(type, x, inventory);

		for (let spendData of rowsCols) {
			inventory[spendData.row][spendData.col] = inventory[spendData.row][spendData.col].sub(spendData.amt);
		}
	}, 
	hasInInventory(type, x, inventory = player.alchemy.inventory) {
		x = D(x);
		if (x.lte(0)) return true;
		let rowsCols = [];

		for (let row in inventory) {
			for (let col in inventory[row]) {
				cell = inventory[row][col];
				if (cell.type == type && cell.amt.gt(0)) {
					rowsCols.push({row, col, amt: x.min(cell.amt)});
					x = x.sub(cell.amt);
					if (x.lte(0)) return rowsCols;
				}
			}
		}
		return false;
	},
	load() {
		Items.loadVue();
		SmeltHandler.load();
	}
}