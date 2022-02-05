const BASE = {
	menuData: {
		id: "base",
		name: "Base",
		style: {
			width: '750px',
			height: '500px'
		},
		load() {
			Vue.component("base-menu", {
				data() { return {
					player,
					Currency,
					upg2Cost: [3e3, 5e10, 1e27]
				}},
				methods: {
					buyUpg0() {
						if (Currency.money.amt.gte(200) && !player.unlocks.base) {
							player.unlocks.base = true;
							Currency.money.use(200);
							canvas.need0update = true;
						}
					},
					buyUpg1() {
						if (Currency.money.amt.gte(50) && !player.unlocks.level) {
							player.unlocks.level = true;
							Currency.money.use(50);
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
					buyUpg5() {
						if (player.auto.obelisk.unl || !Currency.essence.use(1e13)) return;

						player.auto.obelisk.unl = true;
					},
					buyUpg6() {
						if (player.base.alchemy || !Currency.iridite.use(1e5)) return;

						player.base.alchemy = 1;
					},
					buildingAmt
				},
				template: `<div class="centre in-modal">
					<button @click="buyUpg0" :disabled="Currency.money.amt.lt(200)" class="upg-button" v-if="!player.unlocks.base">
						<b>Rebuild the base.</b><br><br>
						Cost: <money-display amt="200" whole="a"></money-display>
					</button>
					<div v-else>
						<button @click="buyUpg1" :disabled="Currency.money.amt.lt(50)" :class="{ 'upg-button': true, bought: player.unlocks.level }">
							<b>Unlocks building levelling.</b><br><br>
							Cost: <money-display amt="50" whole="a"></money-display>
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
						<span v-if="player.base.newBuildings > 0 && player.obelisk.repaired">
							<button @click="buyUpg5" :disabled="Currency.essence.amt.lte(1e13)" :class="{ 'upg-button': true, bought: player.auto.obelisk.unl }">
								<b>The <span class="anti">Obelisk</span> runs itself.</b>
								<br><br>Cost: <essence-display amt="1e13" whole="a"></essence-display>
							</button>
						</span>
						<span v-if="player.base.newBuildings > 1">
							<button @click="buyUpg6" :disabled="Currency.iridite.amt.lte(1e5)" :class="{ 'upg-button': true, bought: player.base.alchemy }">
								<b>Unlock drill depths.</b>
								<br><br>Cost: <iridite-display amt="1e5" whole="a"></iridite-display>
							</button>
						</span>
					</div>
				</div>`
			})
		}
	}
}