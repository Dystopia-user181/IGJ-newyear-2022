let app;

function loadVue() {
	Vue.mixin({
		methods: {
			format,
			formatWhole,
			formatTime
		}
	})
	Notifier.load();
	Modal.load();
	loadCurrency();
	Vue.config.devtools = true;

	Vue.component('top-text', {
		data: () => { return {
			player,
			Decimal,
			Modal,
			tmp,
			Research
		}},
		template: `<div style="position: relative; height: 100%;">
			<div style="position: absolute;">
				<span style="font-size: 20px" class="currency-text"><money-display></money-display> ({{format(tmp.moneyGain, 2, 2, 1)}}/s)</span>
				<span style="font-size: 20px" class="currency-text" v-if="player.base.newBuildings > 0"> | <essence-display></essence-display> ({{format(tmp.essenceGain, 2, 2, 1)}}/s)</span>
				<span style="font-size: 20px" class="currency-text" v-if="player.iridite.newBuildings > 0"> | <iridite-display></iridite-display> ({{format(tmp.iriditeGain, 2, 2, 1)}}/s)</span>
				<br>
				Welcome to Project Iridium. Press WASD to navigate.
			</div>
			<a href="https://discord.gg/DVy4XjB" target="newtab" style="position: absolute; left: 0; bottom: 0;">Discord</a>
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
			<div style="position: absolute; right: 0; bottom: 0;">
				<button v-if="Research.has('core')" onclick="Modal.show({
					title: '⥟ᘊ5⪊Ыᳪៗⱕ␥ዘᑧ⍗ਘᬃ〔ĉ',
					bind: 'end-menu'
				})">End</button>
				<button onclick="Modal.show({
					title: 'Quick Access',
					bind: 'quick-access',
					style: {width: '750px', height: '500px'}
				})">Quick Access</button>
				<button onclick="Modal.show({
					title: 'Controls',
					bind: 'controls-menu'
				})">
					Controls
				</button>
			</div>
		</div>`
	});
	Vue.component('options-menu', {
		data: () => { return {
			player
		}},
		methods: {
			importAsFile(e) {
				const reader = new FileReader();
				reader.onload = function() {
					importSave(reader.result);
				};
				reader.readAsText(event.target.files[0]);
			}
		},
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
			<button class="option" onclick="exportSave()">
				Export save
			</button>
			<button class="option">
				<input
					class="c-file-import"
					type="file"
					accept=".txt"
					@change="importAsFile"
				>
				<label for="file">Import save</label>
			</button>
			<br>
			<span style="font-size: 18px">Visuals:</span>
			<br>
			<button class="option" onclick="player.options.showTilePopups = !player.options.showTilePopups; renderLayer2();">Show "Use" tooltips: {{player.options.showTilePopups ? "ON" : "OFF"}}</button>
			<button class="option" onclick="player.options.gameTimeProd = !player.options.gameTimeProd;">/s display: {{player.options.gameTimeProd ? "GAME TIME" : "REAL TIME"}}</button>
		</div>`
	});
	Vue.component('quick-access', {
		data() { return {
			player
		}},
		methods: {
			buildingAmt
		},
		template: `<div style="padding: 10px" class="centre col">
			<button onclick="openMenu(2, 2)" class="quickaccess">
				Construction
			</button>
			<button onclick="openMenu(3, 3)" v-if="player.unlocks.base" class="quickaccess">
				Base
			</button>
			<button onclick="openMenu(9, 9)" v-if="player.builders > 0" class="quickaccess">
				Queue Expansion
			</button>
			<button onclick="openMenu(10, 10)" v-if="player.obelisk.repaired" class="quickaccess">
				Obelisk
			</button>
			<button onclick="Modal.show({
				title: 'Global Antipoint Space',
				bind: 'antipoint-menu',
				bindData: {
					quick: true
				},
				style: {
					width: '750px',
					height: '500px'
				}
			})" v-if="buildingAmt(5) > 0" class="quickaccess">
				Antipoint
			</button>
			<button onclick="openMenu(20, 20)" v-if="player.unlocks.iridite" class="quickaccess">
				Project Iridium
			</button>
		</div>`
	})
	Vue.component('controls-menu', {
		data: () => { return {
			player
		}},
		template: `<div style="text-align: center;"><br><br><br>
		WASD/arrow keys: Move/Access building<br>
		Shift+WASD/arrow keys: Rotate building when placing<br>
		Space: Place building<br>
		Shift+Space: Place multiple buildings<br>
		I: Sell building<br>
		<span v-if="player.unlocks.level">U: Upgrade building<br></span>
		Q: Open quick access<br>
		E: Open construction menu<br>
		<span v-if="player.unlocks.specializer">O: Open orb specializer<br></span>
		<span v-else-if="player.obelisk.repaired">O: Open obelisk menu<br></span>
		Esc: Close window/Stop placing building/Pause game<br>
		Ctrl+S: Save game
		<br>
		</div>`
	});

	Vue.component('bar', {
		props: ["time", "max"],
		template: `
		<div style="width: 200px; height: 25px; border: 2px solid; position: relative; display: inline-block">
			<div style="width: 200px; height: 25px;" class="centre">
				{{formatTime(max.sub(time))}}
			</div>
			<div style="height: 25px; position: absolute; background-color: #060; top: 0; left: 0; z-index: -1"
			:style="{width: time.mul(200).div(max).min(200) + 'px'}"></div>
		</div>`
	});

	Vue.component('end-menu', {
		template: `<div class="centre col" style="padding: 10px;">
			<div>
				<span>And thus, our scientist has reactivated the iridium core.</span><br><br>
				<span>The core is a mystical object, first built by an ancient civilisation which has since then vanished.</span><br><br>
				<span>The core holds immeasurable time-bending powers, but the actual details are vague. The civilisation did not leave any notes or messages
				that tell of the core's power.</span><br><br>
				<span>It is your job to find out what it does.</span><br><br>
			</div>
			<h2>You have beaten the game... For now.</h2>
		</div>`
	})

	loadMobile();

	loadMenus();
	
	app = new Vue({
		el: "#app",
		data: {
			player,
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
