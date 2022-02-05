ESSENCECOLLECTOR.menuData = {
	id: "essencecollector",
	name: "Essence Collector",
	load() {
		Vue.component("essencecollector-menu", {
			data() { return {
				Building,
				player,
				BD
			}},
			methods: {
				formatTime,
				timerate,
				scaleTimeDisp
			},
			computed: {
				b() {
					return Building.getByPos(this.data.x, this.data.y);
				}
			},
			props: ["data"],
			template: `<div style="padding: 10px">
				<div v-if="!b.upgrading">
					<h3>Level {{b.level + 1}}</h3>
					Production<br>

					<essence-display :amt="scaleTimeDisp(BD[3].getProduction(data.x, data.y))"></essence-display>/s

					<br><br>
					<button @click="Building.sell(data.x, data.y)">Sell</button><br>

					<button @click="Building.level(data.x, data.y)" v-if="player.unlocks.level"
					:disabled="!Building.canAffordLevel(3, b.level)">
						Upgrade ({{formatTime(BD[3].levelTime(b.level))}})<br>
						Cost: <money-display :amt="BD[3].levelCost(b.level)" whole="a"></money-display>
					</button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}