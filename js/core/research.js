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
			return Research.has("triplerII")
		}
	},
	acv2: {
		cost: D(2e6),
		desc: `Increase time speed gained from charging, but make it decay faster.`,
		get unlocked() {
			return Research.has("doublerIII")
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
			return Research.has("triplerII")
		}
	},
	idl2: {
		cost: D(2e6),
		desc: `Passively gain <span class="anti">^$</span> and <span class="anti">^*</span>.`,
		get unlocked() {
			return Research.has("doublerIII")
		}
	},
	rep1: {
		cost: D(3.2e6),
		desc: `Repurpose <span class="essence">essence collectors</span>.`,
		get unlocked() {
			return Research.has("idl2") && Research.has("acv2");
		}
	},
	rep2: {
		cost: D(2e10),
		desc: `Repurpose <span class="money">gold mines</span>.`,
		get unlocked() {
			return Research.has("rep1");
		}
	},
	orb1: {
		cost: D(2.5e14),
		desc: `You can hold up to 5 uncollected orbs per energizer.`,
		get unlocked() {
			return Research.has("rep2");
		}
	},
	orb2: {
		cost: D(2.5e14),
		desc: `Each orb gives two specializations.`,
		get unlocked() {
			return Research.has("rep2");
		}
	},
	rep3: {
		cost: D(2.3e23),
		desc: `Repurpose enhancers to increase orb gain.`,
		get unlocked() {
			return Research.has("orb1") || Research.has("orb2");
		}
	},
	rep4: {
		cost: D(2.3e23),
		desc: `Repurpose enhancers to increase <span class="iridite">iridite drill</span> efficiency.`,
		get unlocked() {
			return Research.has("orb1") || Research.has("orb2");
		}
	},
	auto1: {
		cost: D(4.4e44),
		desc: `Automatically collect orbs from energizers.`,
		get unlocked() {
			return Research.has("rep3") && Research.has("rep4");
		}
	},
	core: {
		cost: D(Math.PI*1e69),
		desc: `Rebuild the iridium core.`,
		get unlocked() {
			return Research.has("auto1");
		},
		onComplete() {
			Modal.show({
				title: "⥟ᘊ5⪊Ыᳪៗⱕ␥ዘᑧ⍗ਘᬃ〔ĉ",
				bind: "end-menu"
			})
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
			if (RS[x].onComplete) RS[x].onComplete();
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

function softcap(value, cap, power = 0.5) {
	if (value.lte(cap)) return value
	else
		return value.pow(power).times(cap.pow(D(1).sub(power)))
}

const Orbs = {
	moneyEffect() {
		return Decimal.pow(20, softcap(player.iridite.orbEffects.money, D(1100), 0.2).pow(0.7));
	},
	essenceEffect() {
		return Decimal.pow(10,  softcap(player.iridite.orbEffects.essence, D(1100), 0.2).pow(0.65));
	},
	iriditeEffect() {
		return Decimal.pow(3, softcap(player.iridite.orbEffects.iridite, D(1100), 0.2).pow(0.6));
	},
	timeEffect() {
		return player.iridite.orbEffects.time.add(0.5).pow(2).add(0.75);
	},
	energyEffect() {
		return player.iridite.orbEffects.energy.pow(1.2).add(5).log10().add(0.30102999566398114);
	}
}