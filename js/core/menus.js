function loadMenus() {
	// Put menu stuff here

	Vue.component("construction-menu", {
		data() { return {
			player
		}},
		methods: {
			showQueueMenu() {
				Modal.show({
					title: "Queue",
					bind: "queue-menu",
					close() {
						openMenu(3, 3);
					}
				})
			},
			queue,
			queueMax
		},
		template: `<div>
			<div style="padding: 10px; border-bottom: 2px solid;"><u @click="showQueueMenu" style="cursor: pointer;">Queue</u>: {{queue()}}/{{queueMax()}}</div>
			<building-ui :bId="2"></building-ui>
			<building-ui :bId="3" v-if="player.base.newBuildings > 0"></building-ui>
			<building-ui :bId="4" v-if="player.base.newBuildings > 0"></building-ui>
		</div>`
	})

	Vue.component("queue-menu", {
		data() { return {
			player,
			BD
		}},
		methods: {
			buildingAmt,
			buildingList,
			openMenu,
			queue,
			queueMax,
			formatTime
		},
		computed: {
			upgrading() {
				return player.buildings.filter(_ => _.upgrading);
			}
		},
		template: `<div>
			<div style="padding: 10px;">
				Queue: {{queue()}}/{{queueMax()}}
				<h2 style="border-bottom: 2px solid; padding: 2px;">Constructing ({{buildingAmt(1)}})</h2>
				<div v-for="b in buildingList(1)">
					<h3 class="nomargin">{{BD[b.meta.building].name}}</h3>
					<bar :time="b.time" :max="BD[b.meta.building].buildTime"></bar>
				</div>

				<h2 style="border-bottom: 2px solid; padding: 2px;">Upgrading ({{upgrading.length}})</h2>
				<div v-for="b in upgrading">
					<h3 class="nomargin">{{BD[b.t].name}} (Level {{b.level + 1}} -&gt; {{b.level + 2}})</h3>
					<bar :time="b.time" :max="BD[b.t].levelTime(b.level)"></bar>
				</div>
			</div>
		</div>`
	})

	Vue.component("base-menu", {
		data() { return {
			player,
			Currency,
			upg2Cost: [3e3]
		}},
		methods: {
			buyUpg0() {
				if (Currency.money.amt.gte(250)) {
					player.unlocks.base = true;
					Currency.money.amt = Currency.money.amt.sub(250);
				}
			},
			buyUpg1() {
				if (Currency.money.amt.gte(100) && !player.unlocks.level) {
					player.unlocks.level = true;
					Currency.money.amt = Currency.money.amt.sub(100);
				}
			},
			buyUpg2() {
				const cost = this.upg2Cost[player.base.newBuildings];
				if (Currency.money.amt.lt(cost)) return;
				
				Currency.money.use(cost);
				player.base.newBuildings++;
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
				<button @click="buyUpg2" :disabled="Currency.money.amt.lt(upg2Cost[player.base.newBuildings])" :class="{ 'upg-button': true, bought: player.base.newBuildings >= upg2Cost.length }">
					<b>Unlocks a new building.</b>
					<span v-if="player.base.newBuildings < upg2Cost.length">
					<br><br>Cost: <money-display :amt="upg2Cost[player.base.newBuildings]" whole="a"></money-display>
					</span>
				</button>
			</div>
		</div>`
	})

	Vue.component("builder-menu", {
		data() { return {
			player,
			builderCosts: [3e4]
		}},
		methods: {
			buyBuilder() {
				if (player.builders >= this.builderCosts.length) return;
				if (Currency.money.amt.lt(this.builderCosts[player.builders])) return;

				Currency.money.use(this.builderCosts[player.builders]);
				player.builders++;
			}
		},
		template: `<div style="padding: 10px" class="centre col">
			Builders: {{player.builders + 1}}<br><br>
			<button @click="buyBuilder" :class="{'upg-button': true, bought: player.builders >= builderCosts.length}" :disabled="player.currency.money.lt(builderCosts[player.builders])">
				<b>Hire a builder.</b>
				<span v-if="player.builders < builderCosts.length">
				<br><br>Cost: <money-display :amt="builderCosts[player.builders]" whole="a"></money-display>
				</span>
			</button>
		</div>`
	});

	Vue.component("constructing-menu", {
		data() { return {
			BD,
			player,
			Building
		}},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y)
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<h3>{{BD[building.meta.building].name}}</h3>
			Time Left:
			<bar :time="building.time" :max="BD[building.meta.building].buildTime"></bar>
			<div>
				<button @click="Building.stopConstruction(data.x, data.y)">Stop building progress</button>
			</div>
		</div>`
	})

	Vue.component("wall1-menu", {
		data() { return {
			BD,
			player,
			Building
		}},
		methods: {
			destroyTimewall() {
				if (Currency.money.amt.lt(5000)) return;
				Currency.money.use(5000);
				player.timewall.one.destroying = true;
			},
			D
		},
		template: `<div style="padding: 10px" v-if="!player.timewall.one.destroyed" class="centre">
			<button @click="destroyTimewall" :disabled="player.currency.money.lt(5000)" class="upg-button" v-if="!player.timewall.one.destroying">
				<b>Destroy timewall 1.</b><br><br>
				Cost: <money-display :amt="5000" whole="a"></money-display>
			</button>
			<div v-else>
				Destroying timewall 1...<br><br>
				Time left:
				<bar :time="player.timewall.one.time" :max="D(80)"></bar>
			</div>
		</div>`
	})

	Vue.component("obelisk-menu", {
		data() { return {
			player
		}},
		methods: {
			reactivate() {
				if (Currency.essence.amt.lt(50)) return;
				Currency.essence.use(50);
				player.obelisk.repairing = true;
			},
			timerate,
			format,
			D
		},
		template: `<div style="padding: 10px">
			Time rate: x{{format(timerate())}}<br><br>
			<button @click="reactivate" :disabled="player.currency.essence.lt(50)" class="upg-button" v-if="!player.obelisk.repairing && !player.obelisk.repaired">
				<b>Reactivate the Obelisk.</b><br><br>
				Cost: <essence-display :amt="50" whole="a"></essence-display>
			</button>
			<div v-if="player.obelisk.repairing">
				You feel like something's not quite right...<br>
				<bar :time="player.obelisk.time" :max="D(6)"></bar>
			</div>
			<div v-if="player.obelisk.repaired">
				End of content for now
			</div>
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
				<money-display :amt="BD[2].getProduction(data.x, data.y)"></money-display>/s
				<br><br>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.money.lt(BD[2].levelCost(building.level))">Upgrade<br>
				Cost: <money-display :amt="BD[2].levelCost(building.level)" whole="a"></money-display></button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})
	Vue.component("essencecollector-menu", {
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
				<essence-display :amt="BD[3].getProduction(data.x, data.y)"></essence-display>/s
				<br><br>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="false && player.unlocks.level"
				:disabled="player.currency.money.lt(BD[2].levelCost(building.level))">Upgrade<br>
				Cost: <money-display :amt="BD[2].levelCost(building.level)" whole="a"></money-display></button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})
	Vue.component("enhancer-menu", {
		data() { return {
			player,
			Building
		}},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<div v-if="!building.upgrading">
				<h3>Increases production by 300%</h3>
				<br><br>
				<button @click="Building.sell(data.x, data.y)">Sell</button>
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
		computed: {
			building() {
				return Building.getByPos(this.x, this.y);
			}
		},
		props: ["x", "y"],
		template: `<div>
			<h3>{{BD[building.t].name}} (Level {{building.level + 1}} -&gt; {{building.level + 2}})</h3>
			Time Left:
			<bar :time="building.time" :max="BD[building.t].levelTime(building.level)"></bar>
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
	3: {
		id: "essencecollector",
		name: "Essence Collector"
	},
	4: {
		id: "enhancer",
		name: "Enhancer"
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
	"-4": {
		id: "builder",
		name: "Builders"
	},
	"-5": {
		id: "wall1",
		name: "Time Wall (Literal)"
	},
	"-6": {
		id: "obelisk",
		name: "Obelisk"
	}
}