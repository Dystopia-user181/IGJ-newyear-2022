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
			<div style="padding: 10px; border-bottom: 2px solid;">Queue: {{buildingAmt(1) + player.buildings.filter(i => i.upgrading).length}}/1</div>
			<building-ui :bId="2"></building-ui>
		</div>`
	})

	Vue.component("base-menu", {
		data() { return {
			player,
			Currency
		}},
		methods: {
			buyUpg0() {
				if (Currency.money.amt.gte(250)) {
					player.unlocks.base = true;
					Currency.money.amt = Currency.money.amt.sub(250);
				}
			},
			buyUpg1() {
				if (Currency.money.amt.gte(100)) {
					player.unlocks.level = true;
					Currency.money.amt = Currency.money.amt.sub(100);
				}
			}
		},
		template: `<div class="centre in-modal">
			<button @click="buyUpg0" :disabled="Currency.money.amt.lt(250)" class="upg-button" v-if="!player.unlocks.base">
				<b>Rebuild the base.</b><br><br>
				Cost: <money-display amt="250" whole="a"></money-display>
			</button>
			<div v-else>
				<button @click="buyUpg1" :disabled="Currency.money.amt.lt(100)" :class="{ 'upg-button': true, bought: player.unlocks.level }">
					<b>Unlocks building levelling.</b><br><br>
					Cost: <money-display amt="100" whole="a"></money-display>
				</button>
			</div>
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

	Vue.component("wall1-menu", {
		template: `<div style="padding: 10px">
			<h3>I guess this is where it ends for now</h3>
		</div>`
	})

	Vue.component("goldmine-menu", {
		data() { return {
			Building,
			player,
			BD
		}},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<div v-if="!building.upgrading">
				<h3>Level {{building.level + 1}}</h3>
				Production<br>
				<money-display :amt="0.5"></money-display>/s
				<br><br>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.money.lt(BD[2].levelCost(building.level))">Upgrade<br>
				Cost: <money-display :amt="BD[2].levelCost(building.level)" whole="a"></money-display></button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})

	Vue.component("upgrade-progress", {
		data() { return {
			Building,
			player,
			BD
		}},
		methods: {
			formatTime
		},
		computed: {
			building() {
				return Building.getByPos(this.x, this.y);
			}
		},
		props: ["x", "y"],
		template: `<div>
			<h3>{{BD[building.t].name}} (Level {{building.level + 1}} -&gt; {{building.level + 2}})</h3>
			Time Left:
			<div style="width: 200px; height: 25px; border: 2px solid; position: relative; display: inline-block">
				<div style="width: 200px; height: 25px;" class="centre">
					{{formatTime(BD[building.t].levelTime(building.level).sub(building.time))}}
				</div>
				<div style="height: 25px; position: absolute; background-color: #060; top: 0; left: 0; z-index: -1"
				:style="{width: building.time.mul(200).div(BD[building.t].levelTime(building.level)).min(200) + 'px'}"></div>
			</div>
			<div>
				<button @click="Building.stopLevel(x, y)">Stop upgrading progress</button>
			</div>
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
	},
	"-3": {
		id: "base",
		name: "Base",
		style: {
			width: '750px',
			height: '500px'
		}
	},
	"-5": {
		id: "wall1",
		name: "Time Wall (Literal)"
	}
}