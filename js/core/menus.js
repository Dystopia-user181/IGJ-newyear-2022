function loadMenus() {
	// Put menu stuff here

	Vue.component("construction-menu", {
		data() { return {
			player
		}},
		methods: {
			buildingAmt
		},
		template: `<div>
			<div style="padding: 10px; border-bottom: 2px solid;">Queue: {{buildingAmt(1)}}/1</div>
			<building-ui :bId="2"></building-ui>
		</div>`
	})

	Vue.component("constructing-menu", {
		data() { return {
			BUILDINGS,
			player,
			Building
		}},
		methods: {
			formatTime
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y)
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<h3>{{BUILDINGS[building.meta.building].name}}</h3>
			Time Left:
			<div style="width: 200px; height: 25px; border: 2px solid; position: relative; display: inline-block">
				<div style="width: 200px; height: 25px;" class="centre">
					{{formatTime(BUILDINGS[building.meta.building].buildTime.sub(building.time))}}
				</div>
				<div style="height: 25px; position: absolute; background-color: #060; top: 0; left: 0; z-index: -1"
				:style="{width: building.time.mul(200).div(BUILDINGS[building.meta.building].buildTime).min(200) + 'px'}"></div>
			</div>
			<div>
				<button @click="Building.stopConstruction(data.x, data.y)">Stop building progress</button>
			</div>
		</div>`
	})

	Vue.component("goldmine-menu", {
		data() { return {
			Building
		}},
		props: ["data"],
		template: `<div style="padding: 10px">
			Production<br>
			<money-display :amt="1"></money-display>/s
			<br><br>
			<button @click="Building.sell(data.x, data.y)">Sell</button>
		</div>`
	})
}

let accessData = {
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y].t;
	console.log(tileName, x, y);
	let name = MENU_DATA[tileName].name;
	Modal.show({
		title: '<span style="font-size: 35px;">' + name + '</span>',
		bind: MENU_DATA[tileName].id + '-menu',
		bindData: {x, y, tile: map[x][y]},
		style: MENU_DATA[tileName].style || {}
	})
	if (MENU_DATA[tileName].onOpen) MENU_DATA[tileName].onOpen();
}

const MENU_DATA = {
	1: {
		id: 'constructing',
		name: 'BUILDING...'
	},
	2: {
		id: "goldmine",
		name: "Gold Mine"
	},
	"-2": {
		id: 'construction',
		name: 'Construction firm',
		style: {
			width: '750px',
			height: '500px'
		}
	}
}