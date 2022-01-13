const RESEARCHES = {
	start: {
		cost: D(30),
		desc: "You can charge <span class='iridite'>iridite drills</span>."
	},
	doublerI: {
		cost: D(200),
		desc: `Double ${Currency.iridite.text} production.`,
		get unlocked() {
			return Research.has("start");
		},
		get effect() {
			return Research.has("doublerI") ? 2 : 1;
		}
	},
	quintuplerI: {
		cost: D(200),
		desc: `Quintuple ${Currency.money.text} and ${Currency.essence.text} production.`,
		get unlocked() {
			return Research.has("start");
		},
		get effect() {
			return Research.has("quintuplerI") ? 5 : 1;
		}
	},
	triplerII: {
		cost: D(500),
		desc: `Triple iridite mine efficiency.`,
		get unlocked() {
			return Research.has("doublerI");
		},
		get effect() {
			return Research.has("triplerII") ? 3 : 1;
		}
	},
	doublerII: {
		cost: D(40000),
		desc: `Double time speed.`,
		get unlocked() {
			return Research.has("doublerI") || Research.has("quintuplerI");
		},
		get effect() {
			return Research.has("doublerII") ? 2 : 1;
		}
	},
	septuplerII: {
		cost: D(500),
		desc: `Septuple ${Currency.iridite.text} charge gain.`,
		get unlocked() {
			return Research.has("quintuplerI");
		},
		get effect() {
			return Research.has("septuplerII") ? 7 : 1;
		}
	},
	acv1: {
		cost: D(5000),
		desc: `Give a new effect to charging.`,
		get unlocked() {
			Research.has("triplerII")
		}
	},
	acv2: {
		cost: D(4e6),
		desc: `Increase time speed gained from charging, but make it decay faster.`,
		get unlocked() {
			Research.has("doublerIII")
		},
		get effect() {
			return Research.has("acv2") ? 2 : 3
		}
	},
	doublerIII: {
		cost: D(4e5),
		desc: `Double time speed.`,
		get unlocked() {
			return Research.has("doublerII")
		},
		get effect() {
			return Research.has("doublerIII") ? 2 : 1;
		}
	},
	idl1: {
		cost: D(5000),
		desc: `Passively gain <span class="anti">^Δ</span>.`,
		get unlocked() {
			Research.has("triplerII")
		}
	},
	idl2: {
		cost: D(4e6),
		desc: `Passively gain <span class="anti">^$</span> and <span class="anti">^*</span>.`,
		get unlocked() {
			Research.has("doublerIII")
		}
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
					else return a;
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