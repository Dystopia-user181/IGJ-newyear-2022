// Inputs
Item("copperOre").addSmeltingRecipe({
	temperatureRange: "400-5000",
	smeltingSpeed: 0.1,
	products: [{
		type: "copperIngot",
		amt: D(1)
	}]
});
Item("tinOre").addSmeltingRecipe({
	temperatureRange: "300-5000",
	smeltingSpeed: 0.1,
	products: [{
		type: "tinIngot",
		amt: D(1)
	}]
});


// Fuels
Item("coal").makeFuel({
	efficiency: D(1),
	temperatureIncrement: D(8)
})