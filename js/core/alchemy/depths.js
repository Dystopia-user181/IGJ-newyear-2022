const DEPTHS = [
	{
		iridite: D(1e-6),
		ores: {}
	},
	{
		iridite: D(3e-6),
		ores: {
			coal: D(0.6),
			copperOre: D(0.3),
			tinOre: D(0.1)
		},
		cost: D(111111)
	}
]

const Depth = {
	buy(b) {
		let d = DEPTHS[b.meta.depth + 1];
		console.log(b.meta.depth + 1, d)
		if (!Depth.canAfford(b, d)) return;
		Currency.iridite.use(d.cost);
		b.meta.depth++;
	},
	canAfford(b, d) {
		return (d.canAfford ?? true) && Currency.iridite.amt.gte(d.cost);
	},
	canAccess(b, d) {
		return DEPTHS[d].accessRequirement ? DEPTHS[d].accessRequirement(b) : true;
	},
	load() {
		Vue.component("depth-ui", {
			props: ["b"],
			data() { return {
				player,
				DEPTHS,
				Depth,
				ITEMS,
				Items,
				chosen: 0
			}},
			methods: {
				format
			},
			template: `<div>
				<br>
				<div class="centre stretch">
					<div style="width: 60%; flex-shrink: 1;">
						<div v-for="(x, d) in DEPTHS.slice(0, b.meta.depth + 2)"
						:class="{ 'depth-segment': true, chosen: chosen == d, locked: b.meta.depth < d }"
						@click="chosen = d"></div>
					</div>

					<div style="width: 80%; flex-shrink: 1;">
						<b>Depth {{chosen*1 + 1}}</b>
						<span v-if="!Depth.canAccess(b, chosen)"><br>Locked: Requires {{DEPTHS[chosen].requirementText}}</span>
						<div v-if="b.meta.depth >= chosen">
							Yield:<br>
							${Currency.iridite.text}: {{format(DEPTHS[chosen].iridite.mul(1e6))}}<br>
							<span v-for="(o, n) in DEPTHS[chosen].ores"><br>
							{{ITEMS[n].displayName}}: {{format(o, 2, 2)}}</span>
						</div>
						<div v-else>
							(LOCKED)<br><br>
							<button @click="Depth.buy(b)" :disabled="!Depth.canAfford(b, DEPTHS[chosen])">
								Unlock for
								<iridite-display :amt="DEPTHS[chosen].cost" whole="a"></iridite-display>
							</button>
						</div>
					</div>

					<inventory-display
					:inv="b.meta.inventory"
					:data="{clickHandler: Items.clickToInventory, rClickHandler: Items.clickToInventory}"
					style="background-color: var(--bg-2);"/>
				</div>
			</div>`
		})
		Items.load();
	}
}