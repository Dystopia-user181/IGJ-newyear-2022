const WALL1 = {
	menuData: {
		id: "wall1",
		name: "Time Wall 1 (Literal)",
		load() {
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
		}
	}
}
const WALL2 = {
	menuData: {
		id: "wall2",
		name: "Time Wall 2 (Literal)",
		load() {
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
					Time rate: x {{format(timerate())}}<br>
					<div v-if="player.timewall.two.destroying">
						Amount subtracted from time rate: -{{format(player.timewall.two.time.mul(0.15))}}
					</div><br>
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
		}
	}
}