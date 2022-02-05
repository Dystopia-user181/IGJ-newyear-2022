const CONSTRUCTING = {
	menuData: {
		id: 'constructing',
		name: 'BUILDING...',
		load() {
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
			});

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
			});
		}
	}
}