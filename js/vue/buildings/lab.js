LAB.menuData = {
	id: "lab",
	name: "Laboratory",
	style: {
		width: '750px',
		height: '500px'
	},
	load() {
		Vue.component("lab-menu", {
			data() { return {
				Building,
				player,
				BD,
				Research,
				tmp,
				tab: "a",
				mouseX: 0,
				mouseY: 0
			}},
			methods: {
				formatTime,
				format,
				D,
				handleAlchemyHeld(event) {
					this.mouseX = event.clientX - this.$refs.tab.getBoundingClientRect().x + 5;
					this.mouseY = event.clientY - this.$refs.tab.getBoundingClientRect().y + 5;
				}
			},
			computed: {
				b() {
					return Building.getByPos(this.data.x, this.data.y);
				},
				furnace() {
					return this.b.meta.smelting;
				}
			},
			props: ["data"],
			template: `<div style="padding: 10px; padding-top: 0px; height: calc(100% - 20px); position: relative;" ref="tab" @click="handleAlchemyHeld" @mousemove="handleAlchemyHeld">
				<div v-if="!b.upgrading" style="margin-top: -5px;">
					<div class="centre" v-if="player.base.alchemy" style="margin-top: 5px;">
						<button :disabled="tab == 'a'" @click="tab = 'a'" class="subtab-button">Main Production</button>
						<button :disabled="tab == 'b'" @click="tab = 'b'" class="subtab-button">Inventory</button>
					</div>

					<div v-if="tab == 'a'">
						<h3>Level {{b.level + 1}}</h3>
						<span style="font-size: 20px"><science-display></science-display> ({{format(tmp.scienceGain)}}/s) (x{{format(BD[7].researchBoost)}} research speed)</span><br><br>

						Production<br>
						<science-display :amt="BD[7].getProduction(data.x, data.y)"></science-display>/s

						<br><br>
						<button @click="Building.sell(data.x, data.y)">Sell</button>
					</div>
					
					<div v-else-if="tab == 'b'">
						<furnace-ui :furnace="furnace"/>
						<br>
						<div class="centre">
							<inventory-display style="width: 100%; flex-shrink: 1;" :inv="player.alchemy.inventory" :data="{}"/>
						</div>

						<item-display :amt="player.alchemy.holding.amt" :type="player.alchemy.holding.type" :style="{
							position: 'absolute',
							top: mouseY + 'px',
							left: mouseX + 'px',
							opacity: 0.7,
							transition: '0s'
						}"/>
					</div>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})
	}
}