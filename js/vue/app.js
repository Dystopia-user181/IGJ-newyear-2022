let app;

function loadVue() {
	Notifier.load();
	Modal.load();
	loadCurrency();
	Vue.config.devtools = true;

	Vue.component('top-text', {
		data: () => { return {
			player,
			format,
			formatWhole,
			Decimal,
			Modal
		}},
		template: `<div style="position: relative; height: 100%;">
			<div style="position: absolute;">
				<span style="font-size: 20px"><money-display></money-display></span>
				<br>
				Welcome to Time Game. Press WASD to navigate.
			</div>
			<a href="https://discord.gg/DVy4XjB" target="newtab" style="position: absolute; left: 0; bottom: 0;">Discord</a>
			<div style="position: absolute; right: 0; bottom: 0;">
				<button onclick="openMenu(3, 3)">
					Construction
				</button>
				<button onclick="Modal.show({
					title: 'Controls',
					bind: 'controls-menu'
				})">
					Controls
				</button>
			</div>
			<div style="position: absolute; right: 0">
				<button onclick="Modal.show({
					title: 'Options',
					bind: 'options-menu'
				})">Options</button>
				<button onclick="paused = true;
				Modal.show({
					title: 'Paused',
					text: \`<br><br>Paused\`,
					close() {
						paused = false;
						Modal.close();
					},
					buttons: [{text: 'Unpause', onClick() {Modal.closeFunc()}}]
				})">Pause</button>
				<button onclick="Modal.show({
					title: 'Credits',
					text: \`<br>
					Game and Graphics: Scarlet<br><br>
					Inspired by: <b>Cleansed</b> by Yhvr (<a href='https://yhvr.itch.io/cleansed' target='newtab'>Link</a>)<br><br>
					People who helped out:
					Yhvr\`,
					buttons: [{text: 'Close', onClick() {Modal.close()}}]
				})">Credits</button>
			</div>
		</div>`
	});
	Vue.component('attributes', {
		data: () => { return {}},
		methods: {
			format
		},
		template: `<div id="attr-container"></div>`
	})
	Vue.component('options-menu', {
		data: () => { return {
			player
		}},
		template: `<div style="text-align: center">
			<span style="font-size: 18px">Saving:</span>
			<br>
			<button class="option" onclick="player.options.autosave = !player.options.autosave;">Autosave: {{player.options.autosave ? "ON" : "OFF"}} (20s)</button>
			<button class="option" onclick="save()">Manual Save</button>
			<button class="option" onclick="Modal.show({
				title: 'Hard Reset',
				text: '<br><br>Are you sure you want to hard reset?',
				buttons: [{
					text: 'Yes',
					onClick() {
						reset();
					}
				},{
					text: 'No',
					onClick() {
						Modal.close();
					}
				}]
			})">HARD RESET</button>
			<br>
			<span style="font-size: 18px">Visuals:</span>
			<br>
			<button class="option" onclick="player.options.showTilePopups = !player.options.showTilePopups; renderLayer2();">Show "Use" tooltips: {{player.options.showTilePopups ? "ON" : "OFF"}}</button>
		</div>`
	});
	Vue.component('controls-menu', {
		data: () => { return {}},
		template: `<div style="text-align: center;"><br><br><br>
		WASD/arrow keys: Move/Access building<br>
		Shift+WASD/arrow keys: Rotate building when placing<br>
		Space: Place building<br>
		Esc: Close Modal/Stop placing building/Pause game<br>
		<br>
		</div>`
	})
	Vue.component('mobile-controls', {
		data: () => { return {
			isMobile,
			placeData
		}},
		template: `<div style="position: absolute; border: 2px solid; background-color: var(--bg2); bottom: 0;" v-if="isMobile">
		</div>`
	})

	loadMenus();
	
	app = new Vue({
		el: "#app",
		data: {
			player,
			format,
			formatWhole,
			Decimal,
			Notifier,
			Modal,
			controls,
			Currency
		},
		methods: {
			D
		}
	})
}