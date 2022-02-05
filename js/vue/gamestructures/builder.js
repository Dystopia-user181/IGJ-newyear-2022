const BUILDER = {
	menuData: {
		id: "builder",
		name: "Queue Expansion",
		load() {
			Vue.component("builder-menu", {
				data() { return {
					player,
					builderCosts: [2e4, 1e8, 1.5e13, 1e18]
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
					Construction machines: {{player.builders + 2}}<br><br>
					<button @click="buyBuilder" :class="{'upg-button': true, bought: player.builders >= builderCosts.length}" :disabled="player.currency.money.lt(builderCosts[player.builders])">
						<b>Buy a construction machine.</b>
						<span v-if="player.builders < builderCosts.length">
						<br><br>Cost: <money-display :amt="builderCosts[player.builders]" whole="a"></money-display>
						</span>
					</button>
				</div>`
			});
		}
	}
}