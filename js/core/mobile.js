function simulateKeypress(key, type, shiftKey = false, ctrlKey = false) {
	window.dispatchEvent(
		new KeyboardEvent(`key${type}`, { key, shiftKey, ctrlKey })
	);
}

let isMobile;
function loadMobile() {
	Vue.component('mobile-controls', {
		data: () => { return {
			simulateKeypress,
			placeData,
			sh: false
		}},
		template: `<div class="mobile-controls">
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
				<button class="mobile"
				@touchstart="simulateKeypress('w', 'down')" @touchend="simulateKeypress('w', 'up')" @blur="simulateKeypress('w', 'up')">W</button>
			</div>
			<div style="display: flex">
				<button class="mobile"
				@touchstart="simulateKeypress('a', 'down')" @touchend="simulateKeypress('a', 'up')" @blur="simulateKeypress('a', 'up')">A</button>
				<button class="mobile"
				@touchstart="simulateKeypress('s', 'down')" @touchend="simulateKeypress('s', 'up')" @blur="simulateKeypress('s', 'up')">S</button>
				<button class="mobile"
				@touchstart="simulateKeypress('d', 'down')" @touchend="simulateKeypress('d', 'up')" @blur="simulateKeypress('d', 'up')">D</button>
			</div>
		</div>`
	})
}
