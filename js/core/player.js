function getStartPlayer() {
	return {
		pos: {x: 0, y: 0},
		unlocks: {
			start: false,
			place: false,
			built: false,
			base: false,
			level: false,
			iridite: false,
			specializer: false
		},
		options: {
			autosave: true,
			showTilePopups: true,
			buildMultiple: false,
			gameTimeProd: true
		},
		time: {
			timeStat: 0,
			thisTick: Date.now(),
			lastSave: 0,
			offline: 0,
			drainOffline: false,
			velocity: 1
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
				timepercent: 0
			}
		},
		currency: {
			money: new Decimal(10),
			essence: new Decimal(0),
			iridite: new Decimal(0),
			science: new Decimal(0),
			orbs: new Decimal(0)
		},
		alchemy: {
			inventory: newObjGrid(4, 8, () => { return {
				type: "coal",
				amt: D(0)
			}}),
			holding: {
				type: "coal",
				amt: D(0)
			}
		},
		base: {
			newBuildings: 0,
			lowerMineCost: 0,
			enhanceCollectors: 0,
			alchemy: 0
		},
		anti: {
			money: D(0),
			essence: D(0),
			time: D(0),
			constTime: 0,
			drain: "none"
		},
		auto: {
			obelisk: {
				unl: false,
				on: false
			}
		},
		iridite: {
			newBuildings: 0,
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
				rep1: D(0),
				rep2: D(0),
				orb1: D(0),
				orb2: D(0),
				rep3: D(0),
				rep4: D(0),
				auto1: D(0),
				core: D(0)
			},
			researching: ""
		},
		builders: 0,
		buildings: [],
		version: "0.1",
		saveKey
	};
}
function newGrid(x, y, init) {
	let grid = [];
	for (let i = 0; i < x; i++) {
		grid.push([]);
		for (let j = 0; j < y; j++) {
			grid[i][j] = init(x, y);
		}
	}
	return grid;
}
function newObjGrid(x, y, init) {
	let grid = {};
	for (let i = 0; i < x; i++) {
		grid[i] = {};
		for (let j = 0; j < y; j++) {
			grid[i][j] = init(x, y);
		}
	}
	return grid;
}

const saveKey = "IGJnewyear-IGJ2022-Scarlet-postjam";
let player;
let struct = {
	inventory: {
		type: String,
		amt: Decimal
	},
	buildings: {
		level: Number,
		pos: {x: Number, y: Number},
		t: Number,
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
let structure = struct;

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
function fixBuildings() {
	for (let b of player.buildings) {
		deepSaveParse(b.meta, BD[b.t].startMeta(b.pos.x, b.pos.y));
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
	if (!struct) return;
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
		if (i == "meta" && struct == structure.buildings) continue;
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
	if (version == "0.0") {
		if (Research.has("doublerII")) {
			setTimeout(() => {
				Modal.show({
					title: "Oops",
					text: `Unfortunately, because the dev (irreversibly) broke everything after the
					first "double time speed" research in the previous update,
					your save needs to be reset. Sorry!<br><br>Contact the discord to retrieve a non-broken save, or
					visit <a href="https://github.com/Dystopia-user181/Project-Iridium-Save-Bank/" target="newtab">this link</a>.`,
					close() {
						reset();
					}
				})
			}, 20);
			save = function() {
				reset();
			}
			player.options.autosave = false;
		}
	}
}