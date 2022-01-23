function simulateKeypress(key, type) {
	key = key.toLowerCase();
	if (type == "down") {
		if (typeof controls["press" + key.toUpperCase()] == "function") controls["press" + key.toUpperCase()](new KeyboardEvent(`key${type}`, { key }));
		if (controls[key] != undefined)
			controls[key] = true;
	} else if (type == "up") {
		if (controls[key] != undefined) controls[key] = false;
	}
}

let isMobile = false;

function loadMobile() {
	isMobile = matchMedia("(hover: none) and (pointer: coarse)").matches;
	Vue.component('mobile-controls', {
		data: () => { return {
			simulateKeypress,
			placeData,
			sh: false,
			controls
		}},
		mounted() {
			let { w, a, s, d } = this.$refs;
			let c = { w, a, s, d }
			for (let i in c) {
				c[i].addEventListener("touchstart", () => simulateKeypress(i, "down"));
				c[i].addEventListener("touchend", () => simulateKeypress(i, "up"));
				c[i].addEventListener("touchcancel", () => simulateKeypress(i, "up"));
			}
		},
		template: `<div id="mobile-controls">
			<div style="display: flex" v-if="placeData.node">
				<button class="mobile fulltxt" style="width: 70px;"
				@touchstart="simulateKeypress(' ', 'down')">Place</button>
				<button class="mobile fulltxt" style="width: 70px;"
				@touchstart="simulateKeypress('escape', 'down')">Stop</button>
				<button class="mobile fulltxt" style="width: 70px;"
				@touchstart="sh = !sh; simulateKeypress('shift', sh ? 'down' : 'up')"
				:style="{'background-color': 'var(--bg-' + (sh*2 + 1) + ')'}">Shift</button>
			</div>
			<div style="display: flex">
				<button class="mobile" style="visibility: hidden"></button>
				<button class="mobile" ref="w" id="w" :class="{ 'anti-button': controls.w }">W</button>
			</div>
			<div style="display: flex">
				<button class="mobile" ref="a" :class="{ 'anti-button': controls.a }">A</button>
				<button class="mobile" ref="s" :class="{ 'anti-button': controls.s }">S</button>
				<button class="mobile" ref="d" :class="{ 'anti-button': controls.d }">D</button>
			</div>
		</div>`
	})
}
