ENHANCER.menuData = {
	id: "enhancer",
	name: "Enhancer",
	load() {
		Vue.component("enhancer-menu", {
			data() { return {
				player,
				Building,
				dStyle: {
					width: "25px",
					height: "25px",
					margin: "2px",
					"border-radius": "2px",
					display: "inline-block"
				},
			}},
			methods: {
				color(x) {
					if (x == 22) return "#fafd";
					if (this.b2List.includes(x)) return "#0c0b";
					if (this.b3List.includes(x)) return "#c0cb";
					return "#fff4";
				}
			},
			computed: {
				building() {
					return Building.getByPos(this.data.x, this.data.y);
				},
				b2List() {
					let list = [];
					for (let i = -1; i <= 1; i++) {
						for (let j = -1; j <= 1; j++) {
							let pos = [this.data.x + i, this.data.y + j];
							if (pos[0] < 1 || pos[0] > mapWidth - 2) continue;
							if (pos[1] < 1 || pos[1] > mapWidth - 2) continue;
							if (map[pos[0]][pos[1]].t != 2) continue;
							let b = Building.getByPos(...pos);
							if (!b.upgrading) {
								list.push(i + j*10 + 22);
							}
						}
					}
					return list;
				},
				b3List() {
					let list = [];
					for (let i = -1; i <= 1; i++) {
						for (let j = -1; j <= 1; j++) {
							let pos = [this.data.x + i, this.data.y + j];
							if (pos[0] < 1 || pos[0] > mapWidth - 2) continue;
							if (pos[1] < 1 || pos[1] > mapWidth - 2) continue;
							if (map[pos[0]][pos[1]].t != 3) continue;
							let b = Building.getByPos(...pos);
							if (!b.upgrading) {
								list.push(i + j*10 + 22);
							}
						}
					}
					return list;
				},
			},
			props: ["data"],
			template: `<div style="padding: 10px">
				<div v-if="!building.upgrading" style="position: relative;">
					<h3>Increases production by 300%</h3>
					<br>
					
					<div>
						<div class="centre" v-for="x in 3">
							<div v-for="y in 3" :style="{...dStyle, 'background-color': color(x*10 + y)}"></div>
						</div>
					</div>
					<br>

					<button @click="Building.sell(data.x, data.y)">Sell</button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}