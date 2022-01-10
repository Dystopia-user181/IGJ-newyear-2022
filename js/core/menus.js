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
			<building-ui :bId="3"></building-ui>
			<building-ui :bId="4"></building-ui>
			<building-ui :bId="5" v-if="player.base.newBuildings > 0"></building-ui>
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
			upg2Cost: [3e3, 1e11]
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
			},
			buyUpg3() {
				if (Currency.money.amt.lt(2e5) || buildingAmt(2) < 16) return;

				Currency.money.use(2e5);
				player.base.lowerMineCost = 1;
			},
			buyUpg4() {
				if (Currency.money.amt.lt(2e7)) return;

				Currency.money.use(2e7);
				player.base.enhanceCollectors = 1;
			},
			buildingAmt
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
				<button @click="buyUpg3" :disabled="Currency.money.amt.lt(2e5) || buildingAmt(2) < 16" :class="{ 'upg-button': true, bought: player.base.lowerMineCost }">
					<b><span class="money">Mines</span> scale slower.</b>
					<span v-if="buildingAmt(2) < 16 && !player.base.lowerMineCost"><br>Requirement: {{buildingAmt(2)}}/16 gold mines placed</span>
					<br><br>Cost: <money-display amt="2e5" whole="a"></money-display>
				</button>
				<br>
				<span v-if="player.base.newBuildings > 0">
					<button @click="buyUpg4" :disabled="Currency.money.amt.lt(2e7)" :class="{ 'upg-button': true, bought: player.base.enhanceCollectors }">
						<b>Enhancers <span class="essence">enhance</span> collectors.</b>
						<br><br>Cost: <money-display amt="2e7" whole="a"></money-display>
					</button>
				</span>
			</div>
		</div>`
	})

	Vue.component("builder-menu", {
		data() { return {
			player,
			builderCosts: [3e4, 1.2e5, 1e6, 2e8, 1.5e13]
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
			player,
			tmp,
			Obelisk
		}},
		methods: {
			reactivate() {
				if (Currency.essence.amt.lt(50)) return;
				Currency.essence.use(50);
				player.obelisk.repairing = true;
			},
			activate() {
				if (Currency.essence.amt.lt(40) || player.obelisk.activeTime.gt(0) || player.obelisk.cooldownTime.lt(tmp.obelisk.cooldownTime)) return;
				Currency.essence.use(40);
				player.obelisk.activeTime = D(0.0001);
			},
			timerate,
			format,
			formatTime,
			D
		},
		template: `<div style="padding: 10px">
			Time rate: x {{format(timerate())}}<br><br>
			<button @click="reactivate" :disabled="player.currency.essence.lt(50)" class="upg-button" v-if="!player.obelisk.repairing && !player.obelisk.repaired">
				<b>Reactivate the Obelisk.</b><br><br>
				Cost: <essence-display :amt="50" whole="a"></essence-display>
			</button>
			<div v-if="player.obelisk.repairing">
				You feel like something's not quite right...<br>
				<bar :time="player.obelisk.time" :max="D(6)"></bar>
			</div>
			<div v-if="player.obelisk.repaired" class="centre col">
				Obelisk effect: x{{format(tmp.obelisk.effect)}} time rate ({{player.obelisk.activeTime.gt(0) ? "" : "IN"}}ACTIVE)<br><br>

				<span v-if="player.obelisk.activeTime.gt(0)">
					Time active: <bar :time="player.obelisk.activeTime" :max="tmp.obelisk.activeTime"></bar>
				</span>
				<span v-else>
					Cooldown: <bar :time="player.obelisk.cooldownTime" :max="tmp.obelisk.cooldownTime"></bar>
				</span>
				<br>

				<button @click="activate" :disabled="player.currency.essence.lt(40) || player.obelisk.activeTime.gt(0) || player.obelisk.cooldownTime.lt(tmp.obelisk.cooldownTime)" class="upg-button">
					<b>{{player.obelisk.activeTime.gt(0) ? "(ACTIVE)" : "Activate the Obelisk."}}</b>
					<span v-if="player.obelisk.activeTime.lte(0)"><br><br>Cost: <essence-display :amt="40" whole="a"></essence-display></span>
				</button>

				<div>
					<button @click="Obelisk.buyActiveUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.activeUpgCost())">
						<b>Increase active time by 30%.</b><br>
						Currently: {{formatTime(tmp.obelisk.activeTime)}}<br><br>
						Cost: <essence-display :amt="Obelisk.activeUpgCost()" whole="a"></essence-display>
					</button>
					<button @click="Obelisk.buyCooldownUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.cooldownUpgCost())">
						<b>Decrease cooldown time by 20%.</b><br>
						Currently: {{formatTime(tmp.obelisk.cooldownTime)}}<br><br>
						Cost: <essence-display :amt="Obelisk.cooldownUpgCost()" whole="a"></essence-display>
					</button>
					<button @click="Obelisk.buyPowerUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.powerUpgCost())">
						<b>Increase obelisk power by 30%.</b><br>
						Currently: {{format(tmp.obelisk.effect)}}<br><br>
						Cost: <essence-display :amt="Obelisk.powerUpgCost()" whole="a"></essence-display>
					</button>
				</div>
			</div>
		</div>`
	})

	Vue.component("goldmine-menu", {
		data() { return {
			Building,
			player,
			BD
		}},
		methods: {
			formatTime,
			buildingAmt
		},
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
				<button @click="Building.sell(data.x, data.y)"
				:disabled="buildingAmt(2) < 2">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.money.lt(BD[2].levelCost(building.level))">Upgrade ({{formatTime(BD[2].levelTime(building.level))}})<br>
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
		methods: {
			formatTime
		},
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
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.money.lt(BD[3].levelCost(building.level))">Upgrade ({{formatTime(BD[3].levelTime(building.level))}})<br>
				Cost: <money-display :amt="BD[3].levelCost(building.level)" whole="a"></money-display></button>
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
	Vue.component("antipoint-menu", {
		data() { return {
			player,
			Building,
			tab: "a",
			tmp,
			BD
		}},
		methods: {
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<div v-if="!building.upgrading">
				<div class="centre">
					<button @click="tab = 'a'" :disabled="tab == 'a'" style="width: 30%; padding: 6px; margin: 4px;">Global Drain</button>
					<button @click="tab = 'b'" :disabled="tab == 'b'" style="width: 30%; padding: 6px; margin: 4px;">Global Effects</button>
				</div>
				<h2 v-if="BD[5].getEffect(data.x, data.y).lt(1)">This antipoint is enduring competition with nearby antipoints, lowering its effectiveness</h2>
				<div class="col centre" style="padding: 10px;" v-if="tab == 'a'">
					<button :disabled="player.anti.drain == 'none'" class="upg-button" style="min-height: 120px;" @click="player.anti.drain = 'none'">
						<span v-if="player.anti.drain != 'none'">
							<b class="anti">{{player.anti.drain[0].toUpperCase() + player.anti.drain.slice(1)}} drain</b><br><br>
							<i class="sub">Disable</i>
						</span>
						<span v-else>
							You aren't draining anything.
						</span>
					</button>
					<br>
					<div>
						<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'money'">
							<b>Drain <b class="anti">Money</b></b><br><br>
							Removes 0.3% <span class="money">$</span> every second and converts it to <span class="anti">^$</span>
						</button>
						<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'essence'">
							<b>Drain <b class="anti">Essence</b></b><br><br>
							Removes 0.3% <span class="essence">*</span> every second and converts it to <span class="anti">^*</span>
						</button>
						<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'time'">
							<b>Drain <b class="anti">Time</b></b><br><br>
							Reverses and amplifies flow of time, converting it to <span class="anti">^Δ</span>
						</button>
					</div>
				</div>
				<div style="padding: 10px;" v-if="tab == 'b'">
					<span style="font-size: 20px;"><span class="anti">^$</span> {{format(player.anti.money)}} | 
					<span class="anti">^*</span> {{format(player.anti.essence)}} | 
					<span class="anti">^Δ</span> {{format(player.anti.time)}}</span><br><br>
					<span class="anti" style="font-size: 20px;">^$</span>: <span class="essence">*</span> gain x{{format(tmp.anti.moneyEffect)}}<br>
					<span class="anti" style="font-size: 20px;">^*</span>: <span class="money">$</span> gain x{{format(tmp.anti.essenceEffect)}}<br>
					<span class="anti" style="font-size: 20px;">^Δ</span>: Time rate x{{format(tmp.anti.timeEffect)}}<br><br>
					The effectiveness of above effects is {{format(tmp.anti.antisum)}} (increases with antipoints built)
				</div>
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
		bindData: {x, y, tile: map[x][y], isBuilding: (tileName in BD), canUpg: (tileName in BD) && ("levelCost" in BD[tileName])},
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
	5: {
		id: "antipoint",
		name: "Antipoint",
		style: {
			width: '750px',
			height: '500px'
		}
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
		name: "Obelisk",
		style: {
			width: '750px',
			height: '500px'
		}
	}
}