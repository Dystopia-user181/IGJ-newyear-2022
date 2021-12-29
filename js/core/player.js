function getStartPlayer() {
	return {
		pos: {x: 0, y: 0},
		unlocks: {
			start: false,
			place: false
		},
		options: {
			autosave: true,
			showTileU: true
		},
		time: {
			timeStat: 0,
			lastTick: Date.now()
		},
		testValue: new Decimal(0)
	};
}
let saveKey = "IGJnewyear-IGJ2022-Scarlet";
let player;
let struct = {
	buildings: {},
	map: {
		t: Number,
		data: {}
	},
	pos: Number
}

function loadPlayer() {
	player = getStartPlayer();
}

function getArrayDiscrepancy(a, b) {
	return (a.constructor == Array) ^ (b.constructor == Array)
} 

function deepSaveParse(data, initData) {
	for (let i in initData) {
		let initProp = initData[i];

		if (data[i] == undefined || (typeof data[i] !== typeof initData[i]) || getArrayDiscrepancy(data[i], initData[i]))
			data[i] = initProp;

		if (initProp.constructor == Object || Array.isArray(initProp)) 
			deepSaveParse(data[i], initProp);
		else if (typeof initProp == "object")
			Object.setPrototypeOf(data[i], initProp.constructor.prototype);
	}
}

function deepDecimalise(data) {
	for (let i in data) {
		let prop = data[i];
		
		if (prop.constructor == Object) {
			deepDecimalise(prop);
		} else if (Array.isArray(prop)) {
			decimaliseArray(prop, struct[i]);
		}
	}
}

function decimaliseArray(data, struct) {
	for (let i in data) {
		let prop = data[i];
		if (struct.constructor !== Object) {
			if (typeof data[i] !== "object") return;
			Object.setPrototypeOf(data[i], struct.prototype);
			continue;
		}

		if (Array.isArray(prop))
			decimaliseArray(prop, struct);
		else
			decimaliseProperties(prop, struct);
	}
}

function decimaliseProperties(data, struct) {
	for (let i in data) {
		if (struct[i].constructor == Object) {
			decimaliseProperties(data[i], struct[i]);
		} else if (struct[i] == Array) {
			decimaliseArray(data[i], i);
		} else {
			if (typeof data[i] !== "object") continue;
			Object.setPrototypeOf(data[i], struct[i].prototype);
		}
	}
}