const IRIDIUMRESEARCH = {
	menuData: {
		id: "iridium",
		name: "Project Iridium",
		style: {
			width: "100%",
			height: "calc(100% - 112px)",
			top: "108px",
			left: "0",
			transform: "translate(0, 0)",
			"overflow-x": "auto"
		},
		load() {
			Vue.component("iridium-menu", {
				data() { return {
					player,
					layout: [
					["start"],
					["doublerI", "quintuplerI"],
					["triplerII", "doublerII", "septuplerII"],
					["acv1-active", "doublerIII", "idl1-idle"],
					["acv2-active", "idl2-idle"],
					["rep1"],
					["rep2"],
					["orb1-idle", "orb2-active"],
					["rep3", "rep4"],
					["auto1"],
					["core"]
					],
					RS
				}},
				methods: {
					buildingList,
					buyUpg0() {
						if (this.mines < 64 || this.collectors < 32) return;
						let m = buildingList(2), e = buildingList(3);
						for (let i of m) {
							Building.sell(i.pos.x, i.pos.y);
						}
						for (let i of e) {
							Building.sell(i.pos.x, i.pos.y);
						}
						player.iridite.newBuildings = 1;
					}, 
					buyUpg1() {
						if (Currency.iridite.amt.lt(15)) return;
						Currency.iridite.use(15);
						player.unlocks.iridite = true;
					},
					nlsco(a, b) {
						if (a == null || a == undefined) return b;
						else return a;
					}
				},
				computed: {
					mines() {
						return buildingList(2).filter(i => i.level >= 8).length;
					},
					collectors() {
						return buildingList(3).filter(i => i.level >= 5).length;
					}
				},
				mounted() {
					if (this.$refs.researches) {
						this.$refs.researches.scrollIntoView({block: "end"})
					}
				},
				template: `<div style="padding: 10px" class="centre col">
					<div class="centre" v-if="!player.iridite.newBuildings">
						<button class="upg-button" :disabled="mines < 64 || collectors < 32" @click="buyUpg0">
							<b>Remove <span class="money">gold mines</span> and <span class="essence">essence collectors</span>, but unlock a new building.</b><br><br>
							Req: {{mines}}/64 level 9 gold mines, {{collectors}}/32 level 6 essence collectors
						</button>
					</div>
					<div class="centre col" v-else-if="!player.unlocks.iridite">
						<h2>Project Iridium</h2>
						<span>Welcome aboard, unnamed scientist.<br>Our goal is to find ways to bend time to our will.<br>
						You have proven worthy of the task so far. Don't disappoint us.<br><br></span>
						<button @click="buyUpg1" :disabled="player.currency.iridite.lt(15)">Begin the project<br>Cost: <iridite-display amt="15" whole="a"></iridite-display></button>
					</div>
					<div class="centre col" v-else ref="researches">
						<br>
						Iridite production channeled to {{player.iridite.researching ? "research" : "storage"}}
						<br><br>
						<div class="centre" v-for="r in layout">
							<div class="centre" v-if="r.filter(id => nlsco(RS[id.split('-')[0]].unlocked, true)).length > 0">
								<research-ui v-for="id in r" :rId="id.split('-')[0]" :class="id.split('-')[1]"></research-ui>
							</div>
						</div>
					</div>
				</div>`
			})
		}
	}
}