CHARGER.menuData = {
	id: "charger",
	name: "Charger",
	style: {
		width: '750px',
		height: '500px'
	},
	load() {
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
				b() {
					return Building.getByPos(this.data.x, this.data.y);
				},
				b6List() {
					let list = [];
					for (let j = 0; j < 4; j++) {
						let pos = getXYfromDir(j, [this.data.x, this.data.y]);
						if (pos[0] < 1 || pos[0] > mapWidth - 2) continue;
						if (pos[1] < 1 || pos[1] > mapWidth - 2) continue;
						if (map[pos[0]][pos[1]].t != 6) continue;
						let b = Building.getByPos(...pos);
						if (!b.upgrading && (!this.b.meta.charging || b.level > 0)) {
							list.push(j);
						}
					}
					return list;
				},
				b8List() {
					let list = [];
					for (let j = 0; j < 4; j++) {
						let pos = getXYfromDir(j, [this.data.x, this.data.y]);
						if (pos[0] < 1 || pos[0] > mapWidth - 2) continue;
						if (pos[1] < 1 || pos[1] > mapWidth - 2) continue;
						if (map[pos[0]][pos[1]].t != 8) continue;
						let b = Building.getByPos(...pos);
						if (!b.upgrading) {
							list.push(j);
						}
					}
					return list;
				},
				effect() {
					return this.b.meta.charging ? BD[7].getEffect2(this.data.x, this.data.y) : BD[7].getEffect(this.data.x, this.data.y)
				}
			},
			props: ["data"],
			template: `<div style="padding: 10px;">
				<div v-if="!b.upgrading">
					<div class="centre stretch">
						<div style="width: 100%; flex-shrink: 1; position: relative; text-align: center">
							<button @click="b.meta.charging = !b.meta.charging" v-if="b.level > 0" style="font-size: 18px"
							:style="{ color: b.meta.charging ? 'var(--c-1)' : 'var(--iridite-colour)' }">
								<b>Charge Mode:</b> {{b.meta.charging ? "Timespeed" : "${Currency.iridite.display} Charge"}}
							</button>
							<b v-else>Production</b><br>

							{{format(effect)}} {{b.meta.charging ? (b.level > 1 ? "s of timespeed" : "timespeed equiv.") : "charge"}}/fill
							<span v-if="b6List.length > 0">({{format(effect.div(b6List.length))}}/drill)</span><br>

							{{format(BD[7].getProduction(data.x, data.y).recip())}}s/fill<br>

							Requirement: Iridite drill is level {{b.meta.charging ? 2 : 1}} or above

							<div style="position: absolute; bottom: 35%; right: 50%; transform: translate(50%, 50%);">
								<div class="centre">
									<div :style="dStyle"></div>
									<div :style="{...dStyle, background: color(3)}"></div>
									<div :style="dStyle"></div>
								</div>
								<div class="centre">
									<div :style="{...dStyle, background: color(2)}"></div>
									<div :style="{...dStyle, background: '#aaeeff' + ('0' + b.meta.time.mul(127).add(128).round().toNumber().toString(16)).slice(-2)}"></div>
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
									height: (250*b.meta.time) + 'px'
								}"></div>
							</div>
							<button @click="b.meta.paused = !b.meta.paused">{{b.meta.paused ? "Unp" : "P"}}ause</button>
						</div>
					</div>

					<button @click="Building.sell(data.x, data.y)">Sell</button><br>
					<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
					:disabled="!Building.canAffordLevel(8, b.level)">Upgrade ({{formatTime(BD[8].levelTime(b.level))}})<br>
					Cost: <essence-display :amt="BD[8].levelCost(b.level)" whole="a"></essence-display></button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}