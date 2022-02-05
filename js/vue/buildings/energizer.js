ENERGIZER.menuData = {
	id: "energizer",
	name: "Energizer",
	style: {
		width: '750px',
		height: '500px'
	},
	load() {
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
						<button @click="tab = 'a'" :disabled="tab == 'a'" :class="{notify: building.meta.charge.gte(1)}" class="subtab-button">Orb Gen</button>
						<button @click="tab = 'b'" :disabled="tab == 'b'" class="subtab-button">Specializer</button>
					</div>

					<div class="centre stretch" v-if="tab == 'a'">
						<div style="width: 100%; flex-shrink: 1; position: relative; text-align: center">
							<orbs-display whole="a" style="font-size: 40px;"></orbs-display><br>
						</div>

						<div style="width: 100%; flex-shrink: 1;" class="centre col">
							<div class="centre">
								<div v-for="x in Research.has('orb1')*4 + 1" style="position: relative; border: 2px solid; width: 50px; height: 250px;">
									<div style="background: linear-gradient(#fd8, #db4); width: 100%; position: absolute; bottom: 0;" :style="{
										height: (250*building.meta.charge.sub(x - 1).clamp(0, 1)) + 'px'
									}"></div>
								</div>
							</div>

							<button style="color: #fd8;" :disabled="building.meta.charge.lt(1)" @click="collect">Collect Orb</button> 
						</div>
					</div>

					<button @click="Building.sell(data.x, data.y)">Sell</button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}