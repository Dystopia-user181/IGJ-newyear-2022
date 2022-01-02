let root;

class CurrencyState {
	constructor(id, data) {
		this.id = id;
		Object.assign(this, data);
		root.style.setProperty("--" + id + "-colour", this.colour);
		Vue.component(id + "-display", {
			props: ["amt"],
			data() { return {
				Currency
			}},
			methods: {
				format
			},
			template: `<span><span class="${id}">${data.display}</span> {{format(amt || Currency.${id}.amt)}}</span>`
		})
		Currency.style += `.${id} {color: var(--${id}-colour)}  `;
	}

	get amt() {
		return player.currency[this.id];
	}
	set amt(x) {
		player.currency[this.id] = new Decimal(x);
	}
}
function addCurrencyState(id, data) {
	Currency[id] = new CurrencyState(id, data);
}

let Currency = {
	style: ""
}

function loadCurrency() {
	root = document.documentElement;
	addCurrencyState("money", {
		colour: "#0a0",
		display: "$"
	})

	let styles = document.createElement("style");
	styles.innerHTML = Currency.style;
	root.appendChild(styles)
}
