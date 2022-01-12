const RESEARCHES = {
	start: {
		cost: D(30),
		desc: "<s>You can charge <span class='iridite'>iridite drills</span>.</s> Doesn't work."
	}
}
const RS = RESEARCHES

const Research = {
	start(x) {
		if (Research.has(x)) return;
		if (player.iridite.researching == x)
			player.iridite.researching = "";
		else
			player.iridite.researching = x;
	},
	stop() {
		player.iridite.researching = "";
	},
	has(x) {
		return player.iridite.researches[x].gte(RS[x].cost);
	},
	update(d, g) {
		let x = player.iridite.researching;
		player.iridite.researches[x] = player.iridite.researches[x].add(g.mul(d));
		if (player.iridite.researches[x].gte(RS[x].cost)) {
			Research.stop();
		}
	},
	load() {
		Vue.component("research-ui", {
			props: ["rId"],
			data() { return {
				player,
				Research,
				RS
			}},
			methods: {
				// nullish coalescing doesn't work inside vue so have this function instead
				nlsco(a, b) {
					if (a == null || a == undefined) return b;
					else return n;
				}
			},
			computed: {
				research() {
					return RS[this.rId];
				}
			},
			template: `<button :class="{research: true, bought: Research.has(rId), researching: player.iridite.researching == rId}" :style="{visibility: nlsco(research.unlocked, true) ? 'visible' : 'hidden'}"
			@click="Research.start(rId)">
				<span v-html="research.desc"></span><br><br>
				<iridite-display :amt="research.cost.sub(player.iridite.researches[rId]).max(0)" whole="a"></iridite-display>
			</button>`
		})
	}
}