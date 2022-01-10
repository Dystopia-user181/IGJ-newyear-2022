function getStartPlayer() {
	return {
		pos: {x: 0, y: 0},
		unlocks: {
			start: false,
			place: false,
			base: false,
			level: false
		},
		options: {
			autosave: true,
			showTilePopups: true,
			buildMultiple: false
		},
		time: {
			timeStat: 0,
			lastTick: Date.now()
		},
		timewall: {
			one: {
				time: D(0),
				destroying: false,
				destroyed: false
			}
		},
		obelisk: {
			time: D(0),
			repairing: false,
			repaired: false,
			activeTime: D(0),
			cooldownTime: D(200),
			upgs: {
				power: 0,
				active: 0,
				cooldown: 0
			}
		},
		currency: {
			money: new Decimal(10),
			essence: new Decimal(0)
		},
		base: {
			newBuildings: 0,
			lowerMineCost: 0,
			enhanceCollectors: 0
		},
		anti: {
			money: D(0),
			essence: D(0),
			time: D(0),
			constTime: 0,
			drain: "none"
		},
		builders: 0,
		buildings: [],
		version: "0.1"
	};
}
let saveKey = "IGJnewyear-IGJ2022-Scarlet";
let player;
let struct = {
	buildings: {
		level: Decimal,
		pos: {x: Number, y: Number},
		t: Number,
		meta: {
			building: Number,
		},
		time: Decimal,
		upgrading: Boolean
	},
	map: {
		t: Number,
		data: {
			forceWalkable: Boolean,
			time: Number
		}
	}
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

function fixOldSave(version) {
	console.log(version);
	if (version == undefined) {
		for (let i = 49; i < 96; i++) {
			if (map[48][i].t == 5)
				map[48][i] = {t: 0};

			if (map[i][48].t == 5)
				map[i][48] = {t: 0};
		}
	}
}