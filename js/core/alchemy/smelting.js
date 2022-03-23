class SmeltingRecipeState {
	constructor(data) {
		this._config = data;
		this.minTemp = D(data.temperatureRange.split("-")[0]);
		this.maxTemp = D(data.temperatureRange.split("-")[1]);
		this.smeltingSpeed = data.smeltingSpeed;
		this.products = data.products.map(x => new SmeltingRecipeProductState(x, [this.minTemp, this.maxTemp]));
	}

	canSmelt(temp) {
		return this.minTemp.lte(temp) && this.maxTemp.gte(temp);
	}
}
class SmeltingRecipeProductState {
	constructor(data, [minTemp, maxTemp]) {
		data.config = data.config || {};
		this.amt = D(data.amt || 1);
		this.type = data.type;
		this._config = {
			minTemp: D(data.config.minTemp || minTemp),
			maxTemp: D(data.config.maxTemp || maxTemp)
		};
	}

	canProduce(temp) {
		return this._config.minTemp.lte(temp) && this._config.maxTemp.gte(temp);
	}
}
class FuelState {
	constructor(data) {
		this.efficiency = data.efficiency;
		this.temperatureIncrement = data.temperatureIncrement;
	}
}
const SmeltHandler = {
	smelt(inv, d, recurred = 0) {
		if (recurred > 20) return;
		inv.tick = inv.tick.add(d*5);
		if (inv.tick.gte(1)) {
			inv.tick = inv.tick.sub(1);
		} else {
			return;
		}

		inv.temperature = inv.temperature.sub(20).mul(0.99).add(20);
		const canProcessItem = inv.input.amt.gte(1);
		const hasFuel = (inv.fuel.amt.gte(1) && Item(inv.fuel).isFuel) || inv.fuelCurrentlyBurning.gt(0);
		const fuelData = Item(inv.fuel).fuelData,
			recipeState = Item(inv.input).smeltingRecipe;

		if ((canProcessItem || inv.preheat || inv.fuelCurrentlyBurning.gt(0)) && hasFuel) {
			// Handles heating code
			if (inv.fuelCurrentlyBurning.lte(0)) {
				if (!(inv.fuel.amt.gte(1) && Item(inv.fuel).isFuel)) return inv.fuelCurrentlyBurning = D(0);
				inv.fuel.amt = inv.fuel.amt.sub(1);
				inv.fuelCurrentlyBurning = inv.fuelCurrentlyBurning.add(fuelData.efficiency);
				inv.lastUsedFuelEfficiency = fuelData.efficiency;
			} else {
				inv.fuelCurrentlyBurning = inv.fuelCurrentlyBurning.sub(0.2);
			}
			inv.temperature = inv.temperature.add(fuelData.temperatureIncrement);
		}
		if (canProcessItem && SmeltHandler.canSmelt(inv.input, inv.temperature)) {
			inv.smeltTime = inv.smeltTime.add(recipeState.smeltingSpeed);
			if (inv.smeltTime.gte(1)) {
				// Handles outputting code
				let tickedOnce = false;
				for (let o of recipeState.products) {
					if (Items.freeSpaceInInventory(o.type, inv.outputs) && o.canProduce(inv.temperature)) {
						Items.insertToInventory(o.type, o.amt, inv.outputs);
						tickedOnce = true;
					}
				}
				if (tickedOnce)
					inv.input.amt = inv.input.amt.sub(1);
				inv.smeltTime = D(0);
			}
		} else {
			inv.smeltTime = D(0);
		}

		if (inv.tick.gte(1)) {
			SmeltHandler.smelt(inv, 0, recurred + 1);
		}
	},

	canSmelt(i, temp) {
		i = Item(i);
		return i.canSmelt && i.smeltingRecipe.canSmelt(temp);
	},
	
	getDefaultInventory(w = 3, h = 2) {
		return {
			tick: D(0),
			input: {
				type: "coal",
				amt: D(0)
			},
			fuel: {
				type: "coal",
				amt: D(0)
			},
			temperature: D(20),
			smeltTime: D(0),
			fuelUsage: D(1),
			fuelCurrentlyBurning: D(0),
			lastUsedFuelEfficiency: D(1),
			outputs: newObjGrid(h, w, () => { return {
				type: "coal",
				amt: D(0)
			}}),
			preheat: false
		}
	},

	load() {
		SmeltHandler.loadVue();
	}
}