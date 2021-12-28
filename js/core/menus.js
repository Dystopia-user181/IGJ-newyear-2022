function loadMenus() {
	// Put menu stuff here
}

let accessData = {
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y].t;
	let name = MENU_DATA[tileName].name || tileName;
	Modal.show({
		title: '<span style="font-size: 35px; color: ' + tileStyle[tileName] + ';">' + name + '</span>',
		bind: MENU_DATA[tileName].id + '-menu',
		bindData: {x, y, tile: map[x][y]},
		style: MENU_DATA[tileName].style || {}
	})
	if (MENU_DATA[tileName].onOpen) MENU_DATA[tileName].onOpen();
}

const MENU_DATA = {
	1: {
		id: 'crystal',
		name: 'Construction firm',
		style: {
			width: '750px',
			height: '500px'
		}
	}
}