function getStartPlayer() {
	return {
		pos: {x: 0, y: 0},
		unlocks: {
			start: false,
			place: false,
			base: false,
			level: false,
			iridite: false
		},
		options: {
			autosave: true,
			showTilePopups: true,
			buildMultiple: false,
			gameTimeProd: true
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
			},
			two: {
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
			essence: new Decimal(0),
			iridite: new Decimal(0)
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
		iridite: {
			newBuilding: 0,
			researches: {
				start: D(0),
				doublerI: D(0),
				quintuplerI: D(0),
				triplerII: D(0),
				doublerII: D(0),
				septuplerII: D(0),
				idl1: D(0),
				idl2: D(0),
				acv1: D(0),
				acv2: D(0),
				doublerIII: D(0),
				rep1: D(0)
			},
			researching: ""
		},
		builders: 0,
		buildings: [],
		version: "0.2"
	};
}
let saveKey = "IGJnewyear-IGJ2022-Scarlet";
let player;
let struct = {
	buildings: {
		level: Number,
		pos: {x: Number, y: Number},
		t: Number,
		meta: {
			charge: Decimal,
			charging: Boolean,
			timespeed: Decimal
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
	if (version == "0.1") {
		player.obelisk.upgs.active = Math.min(player.obelisk.upgs.active, 30);
		player.obelisk.upgs.cooldown = Math.min(player.obelisk.upgs.cooldown, 30);
		player.obelisk.upgs.power = Math.min(player.obelisk.upgs.power, 30);
		for (let i of buildingList(6)) {
			i.meta = BD[6].startMeta(i.pos.x, i.pos.y);
		}
	}
	if (version == undefined) {
		for (let i = 49; i < 96; i++) {
			if (map[48][i].t == 5)
				map[48][i] = {t: 0};

			if (map[i][48].t == 5)
				map[i][48] = {t: 0};
		}
	}
}