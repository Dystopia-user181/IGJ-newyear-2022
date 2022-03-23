function loadMenus() {
	for (const i of Object.values(MENU_DATA)) {
		i.load();
	}
}

let accessData = {
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y].t;
	let name = MENU_DATA[tileName].name;
	Modal.show({
		title: name,
		bind: MENU_DATA[tileName].id + '-menu',
		bindData: {x, y, tile: map[x][y], isBuilding: (tileName in BD), canUpg: (tileName in BD) && ("levelCost" in BD[tileName])},
		style: MENU_DATA[tileName].style || {}
	})
	if (MENU_DATA[tileName].onOpen) MENU_DATA[tileName].onOpen();
}

const MENU_DATA = {
	1: CONSTRUCTING.menuData,
	2: GOLDMINE.menuData,
	3: ESSENCECOLLECTOR.menuData,
	4: ENHANCER.menuData,
	5: ANTIPOINT.menuData,
	6: IRIDITEDRILL.menuData,
	7: LAB.menuData,
	8: CHARGER.menuData,
	9: ENERGIZER.menuData,
	"-2": CONSTRUCTIONFIRM.menuData,
	"-3": BASE.menuData,
	"-4": BUILDER.menuData,
	"-5": WALL1.menuData,
	"-6": OBELISK.menuData,
	"-7": WALL2.menuData,
	"-8": IRIDIUMRESEARCH.menuData
}
