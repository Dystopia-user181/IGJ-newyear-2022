let Notifier = {
	load() {
		Vue.component("notifier", {
			props: ["notifier", "id"],
			data: () => { return {
				Math,
				notifiers: Notifier.notifiers,
				console,
				Vue
			}},
			template: `<div v-if="notifier" class="notifier" @click="Vue.set(notifiers, id, false);" :style="[notifier.style,
			{top: ((notifiers.length - id)*47 - 43) + 'px'}]">
				<span v-html="notifier.text" style="text-align: center;"></span>
			</div>`
		})
		Vue.component("notifier-container", {
			data: () => { return {
				Notifier
			}},
			template: `<div class="notifier-container">
				<notifier v-for="(notifier, id) in Notifier.notifiers" :notifier="notifier" :id="id" :key="notifier.key"></notifier>
			</div>`
		})

		new Updater(diff => {
			let notifiers = Notifier.notifiers;
			while (notifiers.length && player.time.thisTick - notifiers[notifiers.length - 1].time > 3000) {
				notifiers.pop();
			}
		});
	},
	notify(text, style={}) {
		Notifier.notifiers.push({text, time: new Date().getTime(), key: Notifier.count, style})
		Notifier.count++;
	},
	success(text) {
		this.notify(text, {'background-color': '#020', color: '#afa'});
	},
	error(text) {
		this.notify(text, {'background-color': '#200', color: '#faa'});
	},
	notifiers: [],
	count: 0,
	update() {
		let tick = Date.now();
		let iter = 0;
		while (iter < Notifier.notifiers.length && (!Notifier.notifiers[iter] || tick - Notifier.notifiers[iter].time > 3000)) {
			Vue.set(Notifier.notifiers, iter, false);
			iter++;
		}
		if (Notifier.notifiers.filter(_ => !_).length == Notifier.notifiers.length) {
			Notifier.notifiers.splice(0, Notifier.notifiers.length)
		}
	}
}