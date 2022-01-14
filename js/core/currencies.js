let root;

class CurrencyState {
	constructor(id, data) {
		this.id = id;
		Object.assign(this, data);
		this.text = `<span class="${id}">${this.display}</span>`;
		Currency.load.push(function() {
			root.style.setProperty("--" + id + "-colour", this.colour);
			Vue.component(id + "-display", {
				props: ["amt", "whole"],
				data() { return {
					Currency
				}},
				methods: {
					format,
					formatWhole
				},
				template: `<span><span class="${id}">${data.display}</span> {{(whole ? formatWhole : format)(amt || Currency.${id}.amt)}}</span>`
			})
			Currency.style += `.${id} {color: var(--${id}-colour)}  `;
		}.bind(this))
	}

	get amt() {
		return player.currency[this.id];
	}
	set amt(x) {
		player.currency[this.id] = new Decimal(x);
	}

	add(x) {
		this.amt = this.amt.add(x);
	}
	use(x) {
		this.amt = this.amt.sub(x);
	}
}
function addCurrencyState(id, data) {
	Currency[id] = new CurrencyState(id, data);
}

let Currency = {
	style: "",
	load: []
}

addCurrencyState("money", {
	colour: "#0c0",
	display: "$"
})
addCurrencyState("essence", {
	colour: "#c0c",
	display: "*"
})
addCurrencyState("iridite", {
	colour: "#5fb",
	display: "Ø"
})
addCurrencyState("orbs", {
	colour: "#fd8",
	display: "Ω"
})

function loadCurrency() {
	root = document.documentElement;

	for (let i of Currency.load)
		i();

	let styles = document.createElement("style");
	styles.innerHTML = Currency.style;
	root.appendChild(styles)
}
