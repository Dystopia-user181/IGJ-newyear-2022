IRIDITEDRILL.menuData = {
	id: "iriditedrill",
	name: "Iridite Drill",
	style: {
		width: '750px',
		height: '500px'
	},
	load() {
		Vue.component("iriditedrill-menu", {
			data() { return {
				Building,
				player,
				BD,
				Research,
				RS,
				tmp,
				tab: "a"
			}},
			methods: {
				timerate,
				formatTime,
				format,
				scaleTimeDisp
			},
			computed: {
				b() {
					return Building.getByPos(this.data.x, this.data.y);
				},
				prod() {
					return this.b.meta.charging ? [D(0),D(0),BD[6].getProduction(this.data.x, this.data.y)[2]] : BD[6].getProduction(this.data.x, this.data.y)
				}
			},
			props: ["data"],
			template: `<div style="padding: 10px; padding-top: 0px; position: relative; height: calc(100% - 25px)">
				<div class="centre" v-if="player.base.alchemy">
					<button :disabled="tab == 'a'" @click="tab = 'a'" class="subtab-button">Main Production</button>
					<button :disabled="tab == 'b'" @click="tab = 'b'" class="subtab-button">Depth</button>
				</div>
				<div v-if="!b.upgrading" style="margin-top: -5px;">
					<div v-if="tab == 'a'">
						<h3>Level {{b.level + 1}}</h3>
						<div class="centre stretch">
							<div style="width: 100%; flex-shrink: 1;">
								Production<br>

								<money-display :amt="scaleTimeDisp(prod[0])"></money-display>/s<br>

								<essence-display :amt="scaleTimeDisp(prod[1])"></essence-display>/s<br>

								{{b.meta.charging ? (format(scaleTimeDisp(prod[2]).mul(RS.septuplerII.effect)) + " ") : ""}}${Currency.iridite.text}
								{{b.meta.charging ? "charge" : ""}}{{b.meta.charging ? "" : format(scaleTimeDisp(prod[2]))}}/s
							</div>

							<button v-if="Research.has('start')" @click="b.meta.charging = !b.meta.charging"
							:class="{ 'anti-button': b.meta.charging }"
							style="--c-1: #5fb; --c-h: #5fb; color: #5fb; width: 100%; flex-shrink: 1;">
								{{format(b.meta.charge)}} Ø charge (x{{format(b.meta.charge.max(0).add(1).pow(0.25))}} production)<br>
								{{b.meta.charging ? "Stop" : "Start"}} Charging

								<span v-if="Research.has('acv1')"><br>
									Time speed: x{{format(tmp.iridite.timespeed)}}
								</span>
							</button>
						</div>
					</div>
					<depth-ui v-if="tab == 'b'" :b="b"></depth-ui>
					<div style="position: absolute; bottom: 10px;">
						<button @click="Building.sell(data.x, data.y)">Sell</button><br>

						<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
						:disabled="!Building.canAffordLevel(6, b.level)">
							Upgrade ({{formatTime(BD[6].levelTime(b.level))}})<br>
							Cost: <iridite-display :amt="BD[6].levelCost(b.level)" whole="a"></iridite-display>
						</button>
					</div>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})

		Depth.load();
	}
}