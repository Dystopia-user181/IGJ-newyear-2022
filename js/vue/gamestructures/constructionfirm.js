const CONSTRUCTIONFIRM = {
	menuData: {
		id: "construction",
		name: "Construction Firm",
		style: {
			width: "750px",
			height: "500px"
		},
		load() {
			Vue.component("construction-menu", {
				data() { return {
					player,
					Research
				}},
				methods: {
					showQueueMenu() {
						Modal.show({
							title: "Queue",
							bind: "queue-menu",
							close() {
								openMenu(2, 2);
							},
							style: {
								width: "750px",
								height: "500px"
							}
						})
					},
					queue,
					queueMax
				},
				template: `<div>
					<div style="padding: 10px; border-bottom: 2px solid; position: relative;">
						<u @click="showQueueMenu" style="cursor: pointer;">Queue</u>: {{queue()}}/{{queueMax()}}
						<button style="position: absolute; right: 6px; top: 6px;" @click="player.options.buildMultiple = !player.options.buildMultiple">Build Multiple Buildings at a Time: {{player.options.buildMultiple ? "ON" : "OFF"}}</button>
					</div>
					<building-ui :bId="2" v-if="!Research.has('rep2')"></building-ui>
					<building-ui :bId="8" v-else></building-ui>
					<building-ui :bId="3" v-if="!Research.has('rep1')"></building-ui>
					<building-ui :bId="7" v-else></building-ui>
					<building-ui :bId="6" v-if="player.iridite.newBuildings > 0"></building-ui>
					<building-ui :bId="4"></building-ui>
					<building-ui :bId="5" v-if="player.base.newBuildings > 0"></building-ui>
					<building-ui :bId="7" v-if="player.base.newBuildings > 2"></building-ui>
				</div>`
			})
		}
	}
}