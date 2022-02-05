GOLDMINE.menuData = {
	id: "goldmine",
	name: "Gold Mine",
	load() {
		Vue.component("goldmine-menu", {
			data() { return {
				Building,
				player,
				BD
			}},
			methods: {
				formatTime,
				buildingAmt,
				scaleTimeDisp
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
					<money-display :amt="scaleTimeDisp(BD[2].getProduction(data.x, data.y))"></money-display>/s

					<br><br>

					<button @click="Building.sell(data.x, data.y)"
					:disabled="buildingAmt(2) < 2">Sell</button>
					<br>

					<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
					:disabled="!Building.canAffordLevel(2, building.level)">
						Upgrade ({{formatTime(BD[2].levelTime(building.level))}})
						<br>
						Cost: <money-display :amt="BD[2].levelCost(building.level)" whole="a"></money-display>
					</button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}