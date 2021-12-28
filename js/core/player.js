function getStartPlayer() {
	return {
		pos: [0, 0],
		unlocks: {
			start: false,
			place: false
		},
		options: {
			autoSave: false,
			showTileU: true
		},
		time: {
			timeStat: 0,
			lastTick: Date.now()
		}
	};
}
let saveKey = "IGJnewyear-IGJ2022-Scarlet";
let player;

function loadPlayer() {
	player = getStartPlayer();
	if (localStorage.getItem(saveKey)) {
		player = JSON.parse(localStorage.getItem(saveKey));
		deepSaveParse(player, getStartPlayer());
		deepDecimalise(player);
	}
}

function deepSaveParse(data, initData) {
	for (let i in initData) {
		let initProp = initData[i];

		if (data[i] == undefined || (data[i].constructor != initProp.constructor && !initProp instanceof Decimal))
			data[i] = initProp;

		if (initProp.constructor == Object || Array.isArray(initProp)) 
			deepSaveParse(data[i], initProp);
		else if (typeof initProp == "object")
			data[i] = new initProp.constructor(data[i]);
	}
}

function deepDecimalise(data) {
	for (let i in data) {
		let prop = data[i];
		
		if (prop.constructor == Object || Array.isArray(prop)) {
			deepDecimalise(data[i]);
		}
		else if (typeof data[i] == "string") {
			try {
				if (D(data[i]).m != "NaN" && D(data[i]).e != "NaN") data[i] = D(data[i])
			} catch {
				//nothing
			}
		}
	}
}