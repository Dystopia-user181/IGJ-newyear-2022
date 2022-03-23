const ITEMS = [{
	name: "coal",
	displayName: "Coal"
},
{
	name: "copperOre",
	displayName: "Copper Ore"
},
{
	name: "copperIngot",
	displayName: "Copper Ingot"
},
{
	name: "tinOre",
	displayName: "Tin Ore"
},
{
	name: "tinIngot",
	displayName: "Tin Ingot"
},

{
	name: "stoneDrill",
	displayName: "Stone Drill",
	unstackable: 1,
	isDrill: true
},
{
	name: "copperDrill",
	displayName: "Copper Drill",
	unstackable: 1,
	isDrill: true
}].mapToObject(x => x.name, x => new ItemState(x));

function Item(x) {
	if (x instanceof ItemState) return x;
	if (typeof x == "object") x = x.type;
	return ITEMS[x];
}