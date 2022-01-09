const BUILDINGS = {
	2: {
		name: "Gold Mine",
		desc: "Produces <span class='money'>$</span> 0.75/s.",
		get cost() {
			if (player.base.lowerMineCost) {
				if (costAmt(2) >= 64) return Decimal.pow(1.3, Math.pow(costAmt(2), 1.2) - 147).mul(1e8).floor()
				return Decimal.pow(costAmt(2), 3.5).floor();
			}
			return Decimal.pow(1.5, Math.pow(costAmt(2), 1.2)).mul(10).floor();
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(5),
		levelCost(lvl) {
			if (lvl > 6) return D(Infinity);

			return Decimal.pow(10, Math.pow(lvl, 1.19855)).mul(100 + 100*(lvl > 4)).floor();
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(5);

			return Decimal.pow(3 + Math.max(Math.min(lvl - 3, lvl/2 - 1), 0), lvl).mul(2 + 18*(lvl > 4));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(15);
			if (lvl == 1) return D(35);
			if (lvl == 2) return D(60);
			if (lvl == 3) return D(120);
			if (lvl == 4) return D(1800);
			if (lvl == 5) return D(10800);
			if (lvl == 6) return D(10800000);
		},
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let enhancers = 0;
			for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
				for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
					if (map[i][j].t == 4) {
						enhancers++;
					}
				}
			}
			enhancers = Math.min(enhancers, 1);
			return BD[2].levelScaling(b.level).mul(0.75*(1 + enhancers*3));
		}
	},
	3: {
		name: "Essence Collector",
		desc: "Produces <span class='essence'>*</span> 0.05/s.",
		get cost() {
			if (costAmt(3) >= 96) return D(Infinity);
			return Decimal.pow(1.5, Math.pow(costAmt(3), 1.2)).mul(1e3).floor();
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(15),
		levelCost(lvl) {
			if (lvl > 2) return D(Infinity);

			return Decimal.pow(40, Math.pow(lvl, 1.2)).mul(5e5);
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(10);

			return Decimal.pow(4, lvl).mul(2.25 + 12*(lvl > 2));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(30);
			if (lvl == 1) return D(90);
			if (lvl == 2) return D(10800);
		},
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let enhancers = 0;
			if (player.base.enhanceCollectors)
				for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
					for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
						if (map[i][j].t == 4) {
							enhancers++;
						}
					}
				}
			enhancers = Math.min(enhancers, 1);
			return BD[3].levelScaling(b.level).mul(0.05*(1 + enhancers*3));
		}
	},
	4: {
		name: "Enhancer",
		get desc() {
			return `Increases efficiency of gold mines${player.base.enhanceCollectors ? " and essence collectors" : ""} in a 3x3 area.<br>Does not stack.`;
		},
		get cost() {
			return D(Math.pow(costAmt(4)*0.6 + 1, 3)).mul(3).floor();
		},
		currencyName: "essence",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(20)
	},
	4: {
		name: "Antipoint",
		get desc() {
			return `Reverses time and gives buffs in return.<br>Do not place them within 6 metres of each other.`;
		},
		get cost() {
			if (costAmt(5) > 0) return D(Infinity);
			return Decimal.pow(1000, costAmt(5)).mul(5e6);
		},
		currencyName: "essence",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(1800)
	}
}
const BD = BUILDINGS;

let placeData = {
	facing: 0,
	node: ""
}

function buildingList(id) {
	return player.buildings.filter(_ => _.t == id);
}
function buildingAmt(id) {
	return buildingList(id).length;
}
function costAmt(id) {
	id = Number(id);
	return buildingAmt(id) + player.buildings.filter(_ => _.t == 1 && _.meta.building == id).length;
}

const Building = {
	startPlacing(id) {
		let building = BUILDINGS[id];
		if (building.cost.gt(player.currency[building.currencyName])) return;
		if (queue() > queueMax() - 1) return;
		Modal.close();

		if (!player.unlocks.place) {
			Modal.show({
				title: "Placing buildings",
				text: `<br><br>
				Use wasd to move around as normal, and shift+wasd to rotate the building in its place.<br>
				Press space to place the building, and esc to cancel.`,
				close() {}
			})
			setTimeout(() => {
				Modal.show({
					title: "Placing buildings",
					text: `<br><br>
					Use wasd to move around as normal, and shift+wasd to rotate the building in its place.<br>
					Press space to place the building, and esc to cancel.`,
					buttons: [{
						text: "Close",
						onClick() {Modal.close();}
					}]
				})
			}, 1000)
			player.unlocks.place = true;
		}
		placeData.node = id;
		renderLayer1();
	},
	stopPlacing() {
		if (!placeData.node) return;
		let b = BUILDINGS[placeData.node];
		let [x, y] = getXYfromDir(placeData.facing);

		if (!b.canPlace(x, y)) return;

		if (b.onPlace) b.onPlace(x, y);

		player.currency[b.currencyName] = player.currency[b.currencyName].sub(b.cost);

		player.buildings.push({level: 0, pos: {x, y}, meta: {building: placeData.node}, time: D(0), t: 1, upgrading: false});
		map[x][y] = {t: 1};
		if (!player.options.buildMultiple) placeData.node = "";
		render();
		renderLayer1();
		updateTileUsage();
	},
	sell(x, y) {
		Modal.close();
		let building = Building.getByPos(x, y);
		let b = BUILDINGS[building.t];
		if (b.onSell) b.onSell(x, y);

		player.buildings.splice(Building.getByPos(x, y, true), 1);
		player.currency[b.currencyName] = player.currency[b.currencyName].add(b.cost.mul(0.8));
		map[x][y] = {t: 0};
		buildings.delete(x*10000 + y);
		canvas.need0update = true;
		updateTileUsage();
	},
	level(x, y) {
		if (!player.unlocks.level) return;
		let b = Building.getByPos(x, y);
		let cBD = BD[b.t];
		if (Currency[cBD.currencyName].amt.lt(cBD.levelCost(b.level))) return;
		if (queue() > queueMax() - 1) {
			let currentModal = deepcopy(Modal.data);
			let prevCloseFunc = Modal.closeFunc;
			Modal.show({
				title: "Warning",
				text: "Building queue is full (" + queue() + "/" + queueMax() + ")",
				buttons: [{
					text: "Back",
					onClick() {
						Modal.closeFunc();
					}
				}],
				close() {
					deepcopyto(currentModal, Modal.data);
					Modal.closeFunc = prevCloseFunc;
					Modal.data.buttons = [];
				}
			})
			return;
		}
		Currency[cBD.currencyName].amt = Currency[cBD.currencyName].amt.sub(cBD.levelCost(b.level));
		b.upgrading = true;
		canvas.need0update = true;
	},
	stopConstruction(x, y) {
		Modal.close();
		let type = Building.getByPos(x, y).meta.building;
		let id = Building.getByPos(x, y, true);
		let building = BUILDINGS[type];
		player.buildings.splice(id, 1);
		Currency[building.currencyName].amt = Currency[building.currencyName].amt.add(building.cost);
		map[x][y] = {t: 0}
		buildings.delete(x*10000 + y);
		canvas.need0update = true;
		updateTileUsage();
	},
	stopLevel(x, y) {
		let currentModal = deepcopy(Modal.data);
		let prevCloseFunc = Modal.closeFunc;
		Modal.show({
			title: "Confirm",
			text: "Are you sure you want to stop upgrading?",
			buttons: [{
				text: "Yes",
				onClick() {
					let b = Building.getByPos(x, y), cBD = BD[b.t];
					b.upgrading = false;
					b.time = D(0);
					Currency[cBD.currencyName].amt = Currency[cBD.currencyName].amt.add(cBD.levelCost(b.level).mul(0.8));
					Modal.closeFunc();
					canvas.need0update = true;
				}
			}, {
				text: "No",
				onClick() {
					Modal.closeFunc();
				}
			}],
			close() {
				deepcopyto(currentModal, Modal.data);
				Modal.closeFunc = prevCloseFunc;
			}
		})
	},
	getByPos(x, y, id=false) {
		let b = buildings.get(x*10000 + y);
		if (b) return (id ? player.buildings.indexOf(b) : b);
		
		for (let i of player.buildings) {
			if (i.pos.x == x && i.pos.y == y) {
				buildings.set(x*10000 + y, i);
				return id ? i : player.buildings.indexOf(i);
			}
		}
	},
	load() {
		Vue.component("building-ui", {
			props: ["bId", "type"],
			data: () => { return {
				player,
				BUILDINGS,
				tileStyle,
				format,
				Building
			}},
			methods: {
				queue,
				queueMax
			},
			computed: {
				building() {
					return BUILDINGS[this.bId]
				}
			},
			template: `<div :class="{
				'building-segment': true,
				'disabled': player.currency[building.currencyName].lt(building.cost) || queue() >= queueMax()
			}" @click="Building.startPlacing(bId, type)">
				<span style="width: 5px;"></span>
				<span style="width: 620px;">
					<span v-html="building.name" style="font-size: 22px;"></span><br>
					<span v-html="building.desc" style="font-size: 15px; text-align: left;"></span>
				</span>
				<span style="width: 125px; font-size: 18px;">
					<div style="margin-left: 5px; text-align: left;">
						<component :is="building.currencyName + '-display'" :amt="building.cost" whole="a"></component>
					</div>
				</span>
			</div>`
		})
	}
}

let buildings = new Map();
function queue() {
	return buildingAmt(1) + player.buildings.filter(i => i.upgrading).length;
}
function queueMax() {
	let base = 1;
	base = base + player.builders;
	return base;
}
// Map From Building
function mfb(b) {
	return map[b.pos.x][b.pos.y];
}