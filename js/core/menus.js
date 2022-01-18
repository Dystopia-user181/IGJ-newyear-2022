function loadMenus() {
	// Put menu stuff here

	Vue.component("construction-menu", {
		data() { return {
			player,
			Research
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
			<div style="padding: 10px; border-bottom: 2px solid; position: relative;">
				<u @click="showQueueMenu" style="cursor: pointer;">Queue</u>: {{queue()}}/{{queueMax()}}
				<button style="position: absolute; right: 6px; top: 6px;" @click="player.options.buildMultiple = !player.options.buildMultiple">Build Multiple Buildings at a Time: {{player.options.buildMultiple ? "ON" : "OFF"}}</button>
			</div>
			<building-ui :bId="2" v-if="!Research.has('rep2')"></building-ui>
			<building-ui :bId="8" v-else></building-ui>
			<building-ui :bId="3" v-if="!Research.has('rep1')"></building-ui>
			<building-ui :bId="7" v-else></building-ui>
			<building-ui :bId="4"></building-ui>
			<building-ui :bId="5" v-if="player.base.newBuildings > 0"></building-ui>
			<building-ui :bId="6" v-if="player.iridite.newBuildings > 0"></building-ui>
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
				if (Currency.money.amt.gte(250) && !player.unlocks.base) {
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
				if (Currency.money.amt.lt(2e5) || buildingAmt(2) < 16 || player.base.lowerMineCost) return;

				Currency.money.use(2e5);
				player.base.lowerMineCost = 1;
			},
			buyUpg4() {
				if (Currency.money.amt.lt(2e7) || player.base.enhanceCollectors) return;

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
					<button @click="Obelisk.buyActiveUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.activeUpgCost())"
					:class="{bought: player.obelisk.upgs.active >= 30}">
						<b>Increase active time by 30%.</b><br>
						Currently: {{formatTime(tmp.obelisk.activeTime)}}<br><br>
						Cost: <essence-display :amt="Obelisk.activeUpgCost()" whole="a"></essence-display>
					</button>
					<button @click="Obelisk.buyCooldownUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.cooldownUpgCost())"
					:class="{bought: player.obelisk.upgs.cooldown >= 30}">
						<b>Decrease cooldown time by 20%.</b><br>
						Currently: {{formatTime(tmp.obelisk.cooldownTime)}}<br><br>
						Cost: <essence-display :amt="Obelisk.cooldownUpgCost()" whole="a"></essence-display>
					</button>
					<button @click="Obelisk.buyPowerUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.powerUpgCost())"
					:class="{bought: player.obelisk.upgs.power >= 30}">
						<b>Increase obelisk power by 30%.</b><br>
						Currently: {{format(tmp.obelisk.effect)}}<br><br>
						Cost: <essence-display :amt="Obelisk.powerUpgCost()" whole="a"></essence-display>
					</button>
				</div>
			</div>
		</div>`
	})

	Vue.component("wall2-menu", {
		data() { return {
			BD,
			player,
			Building
		}},
		methods: {
			destroyTimewall() {
				if (Currency.money.amt.lt(2e20)) return;
				Currency.money.use(2e20);
				player.timewall.two.destroying = true;
				if (player.anti.drain == "time") player.anti.drain = "none";
			},
			D,
			timerate,
			format
		},
		template: `<div style="padding: 10px" v-if="!player.timewall.two.destroyed" class="centre col">
			Time rate: x {{format(timerate())}}<br><br>
			<button @click="destroyTimewall" :disabled="player.currency.money.lt(2e20)" class="upg-button" v-if="!player.timewall.two.destroying">
				<b>Destroy timewall 2.</b><br><br>
				Cost: <money-display :amt="2e20" whole="a"></money-display>
			</button>
			<div v-else>
				Destroying timewall 2...<br><br>
			</div>
			<div v-if="player.timewall.two.time.gt(0)">
				Time left:
				<bar :time="player.timewall.two.time" :max="D(2592000)"></bar><br><br>
			</div>
			<button v-if="player.timewall.two.destroying" @click="player.timewall.two.destroying = false;">
				Stop destroying
			</button>
		</div>`
	})

	Vue.component("iridite-menu", {
		data() { return {
			player,
			layout: [
			["start"],
			["doublerI", "quintuplerI"],
			["triplerII", "doublerII", "septuplerII"],
			["acv1-active", "doublerIII", "idl1-idle"],
			["acv2-active", "idl2-idle"],
			["rep1"],
			["rep2"],
			["orb1-idle", "orb2-active"],
			["rep3", "rep4"],
			["auto1"],
			["core"]
			],
			RS
		}},
		methods: {
			buildingList,
			buyUpg0() {
				if (this.mines < 96 || this.collectors < 48) return;
				let m = buildingList(2), e = buildingList(3);
				for (let i of m) {
					Building.sell(i.pos.x, i.pos.y);
				}
				for (let i of e) {
					Building.sell(i.pos.x, i.pos.y);
				}
				player.iridite.newBuildings = 1;
			}, 
			buyUpg1() {
				if (Currency.iridite.amt.lt(15)) return;
				Currency.iridite.use(15);
				player.unlocks.iridite = true;
			},
			nlsco(a, b) {
				if (a == null || a == undefined) return b;
				else return a;
			}
		},
		computed: {
			mines() {
				return buildingList(2).filter(i => i.level >= 8).length;
			},
			collectors() {
				return buildingList(3).filter(i => i.level >= 5).length;
			}
		},
		mounted() {
			if (this.$refs.researches) {
				this.$refs.researches.scrollIntoView({block: "end"})
			}
		},
		template: `<div style="padding: 10px" class="centre col">
			<button class="upg-button" :disabled="mines < 96 || collectors < 48" v-if="!player.iridite.newBuildings" @click="buyUpg0">
				<b>Remove <span class="money">gold mines</span> and <span class="essence">essence collectors</span>, but unlock a new building.</b><br><br>
				Req: {{mines}}/96 level 9 gold mines, {{collectors}}/48 level 6 essence collectors
			</button>
			<div class="centre col" v-else-if="!player.unlocks.iridite">
				<h2>Project Iridium</h2>
				<span>Welcome aboard, unnamed scientist.<br>Our goal is to find ways to bend time to our will.<br>
				You have proven worthy of the task so far. Don't disappoint us.<br><br></span>
				<button @click="buyUpg1" :disabled="player.currency.iridite.lt(15)">Begin the project<br>Cost: <iridite-display amt="15" whole="a" @click="buyUpg0"></iridite-display></button>
			</div>
			<div class="centre col" v-else ref="researches">
				<br>
				Iridite production channeled to {{player.iridite.researching ? "research" : "storage"}}
				<br><br>
				<div class="centre" v-for="r in layout">
					<div class="centre" v-if="r.filter(id => nlsco(RS[id.split('-')[0]].unlocked, true)).length > 0">
						<research-ui v-for="id in r" :rId="id.split('-')[0]" :class="id.split('-')[1]"></research-ui>
					</div>
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
			buildingAmt,
			timerate
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
				<money-display :amt="BD[2].getProduction(data.x, data.y).mul(player.options.gameTimeProd ? 1 : timerate())"></money-display>/s
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
			formatTime,
			timerate
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
				<essence-display :amt="BD[3].getProduction(data.x, data.y).mul(player.options.gameTimeProd ? 1 : timerate())"></essence-display>/s
				<br><br>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.money.lt(BD[3].levelCost(building.level))">Upgrade ({{formatTime(BD[3].levelTime(building.level))}})<br>
				Cost: <money-display :amt="BD[3].levelCost(building.level)" whole="a"></money-display></button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})
	Vue.component("iriditedrill-menu", {
		data() { return {
			Building,
			player,
			BD,
			Research,
			tmp
		}},
		methods: {
			timerate,
			formatTime,
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			},
			prod() {
				return this.building.meta.charging ? [D(0),D(0),BD[6].getProduction(this.data.x, this.data.y)[2]] : BD[6].getProduction(this.data.x, this.data.y)
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px">
			<div v-if="!building.upgrading">
				<h3>Level {{building.level + 1}}</h3>
				<div class="centre stretch">
					<div style="width: 100%; flex-shrink: 1;">
						Production<br>
						<money-display :amt="prod[0].mul(player.options.gameTimeProd ? 1 : timerate())"></money-display>/s<br>
						<essence-display :amt="prod[1].mul(player.options.gameTimeProd ? 1 : timerate())"></essence-display>/s<br>
						<iridite-display :amt="prod[2].mul(player.options.gameTimeProd ? 1 : timerate())"></iridite-display>/s
					</div>
					<button v-if="Research.has('start')" @click="building.meta.charging = !building.meta.charging"
					:class="{ 'anti-button': building.meta.charging }" style="--c-1: #5fb; --c-h: #5fb; color: #5fb; width: 100%; flex-shrink: 1;">
						{{format(building.meta.charge)}} Ø charge<br>
						{{building.meta.charging ? "Stop" : "Start"}} Charging
						<span v-if="Research.has('acv1')"><br>
							Time speed: x{{format(tmp.iridite.timespeed)}}
						</span>
					</button>
				</div>
				<br>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.iridite.lt(BD[6].levelCost(building.level))">Upgrade ({{formatTime(BD[6].levelTime(building.level))}})<br>
				Cost: <iridite-display :amt="BD[6].levelCost(building.level)" whole="a"></iridite-display></button>
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
			<div v-if="data.quick || !building.upgrading">
				<div class="centre">
					<button @click="tab = 'a'" :disabled="tab == 'a'" style="width: 30%; padding: 6px; margin: 4px;">Global Drain</button>
					<button @click="tab = 'b'" :disabled="tab == 'b'" style="width: 30%; padding: 6px; margin: 4px;">Global Effects</button>
				</div>
				<h2 v-if="!data.quick && BD[5].getEffect(data.x, data.y).lt(1)">This antipoint is enduring competition with nearby antipoints, lowering its effectiveness</h2>
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
				<button v-if="!data.quick" @click="Building.sell(data.x, data.y)">Sell</button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})
	Vue.component("charger-menu", {
		data() { return {
			player,
			BD,
			dStyle: {
				width: "25px",
				height: "25px",
				margin: "2px",
				"border-radius": "2px",
				display: "inline-block"
			},
			Building
		}},
		methods: {
			format,
			formatTime,
			color(dir) {
				if (this.b6List.includes(dir)) return "#5fbb";
				if (this.b8List.includes(dir)) return "#fd8b";
				return "#fff4";
			}
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			},
			b6List() {
				let list = [];
				for (let j = 0; j < 4; j++) {
					let pos = getXYfromDir(j, [this.data.x, this.data.y]);
					if (map[pos[0]][pos[1]].t != 6) continue;
					let b = Building.getByPos(...pos);
					if (!b.upgrading && (!this.building.meta.charging || b.level > 0)) {
						list.push(j);
					}
				}
				return list;
			},
			b8List() {
				let list = [];
				for (let j = 0; j < 4; j++) {
					let pos = getXYfromDir(j, [this.data.x, this.data.y]);
					if (map[pos[0]][pos[1]].t != 8) continue;
					let b = Building.getByPos(...pos);
					if (!b.upgrading) {
						list.push(j);
					}
				}
				return list;
			},
			effect() {
				return this.building.meta.charging ? BD[7].getEffect2(this.data.x, this.data.y) : BD[7].getEffect(this.data.x, this.data.y)
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px;">
			<div v-if="!building.upgrading">
				<div class="centre stretch">
					<div style="width: 100%; flex-shrink: 1; position: relative; text-align: center">
						<button @click="building.meta.charging = !building.meta.charging" v-if="building.level > 0" style="font-size: 18px"
						:style="{ color: building.meta.charging ? 'var(--c-1)' : 'var(--iridite-colour)' }">
							<b>Charge Mode:</b> {{building.meta.charging ? "Timespeed" : "${Currency.iridite.display} Charge"}}
						</button>
						<b v-else>Production</b><br>
						{{format(effect)}} {{building.meta.charging ? (building.level > 1 ? "s of timespeed" : "timespeed equiv.") : "charge"}}/fill <span v-if="b6List.length > 0">({{format(effect.div(b6List.length))}}/drill)</span><br>
						{{format(BD[7].getProduction(data.x, data.y).recip())}}s/fill<br>
						Requirement: Iridite drills level {{building.meta.charging ? 2 : 1}} or above

						<div style="position: absolute; bottom: 35%; right: 50%; transform: translate(50%, 50%);">
							<div class="centre">
								<div :style="dStyle"></div>
								<div :style="{...dStyle, background: color(3)}"></div>
								<div :style="dStyle"></div>
							</div>
							<div class="centre">
								<div :style="{...dStyle, background: color(2)}"></div>
								<div :style="{...dStyle, background: '#aaeeff' + ('0' + building.meta.time.mul(127).add(128).round().toNumber().toString(16)).slice(-2)}"></div>
								<div :style="{...dStyle, background: color(0)}"></div>
							</div>
							<div class="centre">
								<div :style="dStyle"></div>
								<div :style="{...dStyle, background: color(1)}"></div>
								<div :style="dStyle"></div>
							</div>
						</div>
					</div>
					<div style="width: 100%; flex-shrink: 1;" class="centre col">
						<div style="position: relative; border: 2px solid; width: 50px; height: 250px;">
							<div style="background: linear-gradient(#ecf, #b3d); width: 100%; position: absolute; bottom: 0;" :style="{
								height: (250*building.meta.time) + 'px'
							}"></div>
						</div>
						<button @click="building.meta.paused = !building.meta.paused">{{building.meta.paused ? "Unp" : "P"}}ause</button>
					</div>
				</div>
				<button @click="Building.sell(data.x, data.y)">Sell</button><br>
				<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
				:disabled="player.currency.essence.lt(BD[7].levelCost(building.level))">Upgrade ({{formatTime(BD[7].levelTime(building.level))}})<br>
				Cost: <essence-display :amt="BD[7].levelCost(building.level)" whole="a"></essence-display></button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	})

	Vue.component("energizer-menu", {
		data() { return {
			player,
			BD,
			Building,
			tab: 'a',
			Research
		}},
		methods: {
			format,
			formatTime,
			collect() {
				if (this.building.meta.charge.lt(1)) return;
				let enhancers = 0;
				let {x, y} = this.data;
				for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
					for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
						if (map[i][j].t == 4) {
							enhancers++;
						}
					}
				}
				enhancers = Math.min(enhancers, 0 + Research.has("rep3"));
				this.building.meta.charge = this.building.meta.charge.sub(1);
				Currency.orbs.add(1 + 3*enhancers);
				canvas.need0update = true;
			},
			buyUpg0() {
				if (Currency.orbs.amt.lt(1) || player.unlocks.specializer) return;
				Currency.orbs.use(1);
				player.unlocks.specializer = true;
			}
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y);
			}
		},
		props: ["data"],
		template: `<div style="padding: 10px;">
			<div v-if="!building.upgrading">
				<div class="centre" v-if="player.unlocks.specializer">
					<button @click="tab = 'a'" :disabled="tab == 'a'" :class="{notify: building.meta.charge.gte(1)}" style="width: 30%; padding: 6px; margin: 4px;">Orb Gen</button>
					<button @click="tab = 'b'" :disabled="tab == 'b'" style="width: 30%; padding: 6px; margin: 4px;">Specializer</button>
				</div>
				<div class="centre stretch" v-if="tab == 'a'">
					<div style="width: 100%; flex-shrink: 1; position: relative; text-align: center">
						<orbs-display whole="a" style="font-size: 40px;"></orbs-display><br>
						<button @click="buyUpg0" class="upg-button" :class="{ bought: player.unlocks.specializer }">
							Unlock the orb specializer.<br>
							Cost: <orbs-display amt="1" whole="a"></orbs-display>
						</button>
					</div>
					<div style="width: 100%; flex-shrink: 1;" class="centre col">
						<div class="centre">
							<div style="position: relative; border: 2px solid; width: 50px; height: 250px;">
								<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
									height: (250*building.meta.charge.clamp(0, 1)) + 'px'
								}"></div>
							</div>
							<div style="position: relative; border: 2px solid; width: 50px; height: 250px;" v-if="Research.has('orb1')">
								<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
									height: (250*building.meta.charge.sub(1).clamp(0, 1)) + 'px'
								}"></div>
							</div>
							<div style="position: relative; border: 2px solid; width: 50px; height: 250px;" v-if="Research.has('orb1')">
								<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
									height: (250*building.meta.charge.sub(2).clamp(0, 1)) + 'px'
								}"></div>
							</div>
							<div style="position: relative; border: 2px solid; width: 50px; height: 250px;" v-if="Research.has('orb1')">
								<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
									height: (250*building.meta.charge.sub(3).clamp(0, 1)) + 'px'
								}"></div>
							</div>
							<div style="position: relative; border: 2px solid; width: 50px; height: 250px;" v-if="Research.has('orb1')">
								<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
									height: (250*building.meta.charge.sub(4).clamp(0, 1)) + 'px'
								}"></div>
							</div>
						</div>
						<button style="color: #fd8;" :disabled="building.meta.charge.lt(1)" @click="collect">Collect Orb</button> 
					</div>
				</div>
				<specializer-menu v-else></specializer-menu>
				<button @click="Building.sell(data.x, data.y)">Sell</button>
			</div>
			<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
		</div>`
	});
	Vue.component("specializer-menu", {
		data() { return {
			player,
			Orbs
		}},
		methods: {
			format,
			insert() {
				if (Currency.orbs.amt.lt(1)) return;
				Currency.orbs.use(1);
				let random = Object.keys(player.iridite.orbEffects)[Math.floor(Math.random()*Object.keys(player.iridite.orbEffects).length)];
				player.iridite.orbEffects[random] = player.iridite.orbEffects[random].add(1 + Research.has("orb2"));
			},
			insertAll() {
				if (Currency.orbs.amt.lt(1)) return;
				while (Currency.orbs.amt.gte(1)) {
					this.insert();
				}
			}
		},
		template: `<div class="centre col" style="padding: 10px">
			<orbs-display whole="a" style="font-size: 30px;"></orbs-display>
			<div>
				<button style="color: #fd8;" :disabled="player.currency.orbs.lt(1)" @click="insert">Specialize an Orb</button>
				<button style="color: #fd8;" :disabled="player.currency.orbs.lt(1)" @click="insertAll">Specialize all Orbs</button>
			</div>
			<i class="sub">Choices are random</i><br>
			<div class="centre">
				<div class="specializer">
					<span style="font-size: 20px;">${Currency.money.text}<orbs-display :amt="player.iridite.orbEffects.money" whole="a"></orbs-display></span>
					<br>
					<span>Effect: x{{format(Orbs.moneyEffect())}} ${Currency.money.text} gain</span>
				</div>
				<div class="specializer">
					<span style="font-size: 20px;">${Currency.essence.text}<orbs-display :amt="player.iridite.orbEffects.essence" whole="a"></orbs-display></span>
					<br>
					<span>Effect: x{{format(Orbs.essenceEffect())}} ${Currency.essence.text} gain</span>
				</div>
				<div class="specializer">
					<span style="font-size: 20px;">${Currency.iridite.text}<orbs-display :amt="player.iridite.orbEffects.iridite" whole="a"></orbs-display></span>
					<br>
					<span>Effect: x{{format(Orbs.iriditeEffect())}} ${Currency.iridite.text} gain</span>
				</div>
			</div>
			<div class="centre">
				<div class="specializer">
					<span style="font-size: 20px;">Δ<orbs-display :amt="player.iridite.orbEffects.time" whole="a"></orbs-display></span>
					<br>
					<span>Effect: x{{format(Orbs.timeEffect())}} time rate</span>
				</div>
				<div class="specializer">
					<span style="font-size: 20px;"><span style="color: #aef">Ϟ</span><orbs-display :amt="player.iridite.orbEffects.energy" whole="a"></orbs-display></span>
					<br>
					<span>Effect: x{{format(Orbs.energyEffect())}} charge speed</span>
				</div>
			</div>
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
	6: {
		id: "iriditedrill",
		name: "Iridite Drill"
	},
	7: {
		id: "charger",
		name: "Charger",
		style: {
			width: '750px',
			height: '500px'
		}
	},
	8: {
		id: "energizer",
		name: "Energizer",
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
	},
	"-7": {
		id: "wall2",
		name: "Time Wall 2 (Literal)"
	},
	"-8": {
		id: "iridite",
		name: "Iridium",
		style: {
			width: "100%",
			height: "calc(100% - 112px)",
			top: "108px",
			left: "0",
			transform: "translate(0, 0)",
			"overflow-x": "auto"
		}
	}
}
