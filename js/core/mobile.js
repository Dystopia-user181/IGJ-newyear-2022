function detectMobile() {
	const toMatch = [
		/Android/i,
		/webOS/i,
		/iPhone/i,
		/iPad/i,
		/iPod/i,
		/BlackBerry/i,
		/Windows Phone/i,
	];

	return toMatch.some(toMatchItem => navigator.userAgent.match(toMatchItem));
}

function simulateKeypress(key, type, shiftKey = false, ctrlKey = false) {
	window.dispatchEvent(
		new KeyboardEvent(`key${type}`, { key, shiftKey, ctrlKey })
	);
}

let isMobile;
function loadMobile() {
	isMobile = true//detectMobile();
	Vue.component('mobile-controls', {
		data: () => { return {
			isMobile,
			simulateKeypress,
			placeData,
			sh: false
		}},
		template: `<div style="position: absolute; border: 2px solid; background-color: var(--bg2); bottom: 0;" v-if="isMobile">
			<div style="display: flex" v-if="placeData.node">
				<button class="mobile fulltxt" style="width: 70px;"
				@mousedown="simulateKeypress(' ', 'down')">Place</button>
				<button class="mobile fulltxt" style="width: 70px;"
				@mousedown="simulateKeypress('escape', 'down')">Stop</button>
				<button class="mobile fulltxt" style="width: 70px;"
				@mousedown="sh = !sh; simulateKeypress('shift', sh ? 'down' : 'up')"
				:style="{'background-color': 'var(--bg-' + (sh*2 + 1) + ')'}">Shift</button>
			</div>
			<div style="display: flex">
				<button class="mobile" style="visibility: hidden"></button>
				<button class="mobile"
				@mousedown="simulateKeypress('w', 'down')" @mouseup="simulateKeypress('w', 'up')" @blur="simulateKeypress('w', 'up')">W</button>
			</div>
			<div style="display: flex">
				<button class="mobile"
				@mousedown="simulateKeypress('a', 'down')" @mouseup="simulateKeypress('a', 'up')" @blur="simulateKeypress('a', 'up')">A</button>
				<button class="mobile"
				@mousedown="simulateKeypress('s', 'down')" @mouseup="simulateKeypress('s', 'up')" @blur="simulateKeypress('s', 'up')">S</button>
				<button class="mobile"
				@mousedown="simulateKeypress('d', 'down')" @mouseup="simulateKeypress('d', 'up')" @blur="simulateKeypress('d', 'up')">D</button>
			</div>
		</div>`
	})
}