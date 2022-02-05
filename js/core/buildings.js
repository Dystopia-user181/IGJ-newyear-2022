function toBuilding(x) {
	Object.defineProperty(x, "currency", {
		get() {
			return Currency[this.currencyName];
		}
	})
	return x;
}

const BUILDINGS = {
	2: toBuilding(GOLDMINE.buildingData),
	3: toBuilding(ESSENCECOLLECTOR.buildingData),
	4: toBuilding(ENHANCER.buildingData),
	5: toBuilding(ANTIPOINT.buildingData),
	6: toBuilding(IRIDITEDRILL.buildingData),
	7: toBuilding(LAB.buildingData),
	8: toBuilding(CHARGER.buildingData),
	9: toBuilding(ENERGIZER.buildingData)
}
const BD = BUILDINGS;

let placeData = {
	facing: 0,
	node: ""
}

function buildingList(id) {
	let v = buildingListList.get(id);
	if (v)
		return v;

	buildingListList.set(id, player.buildings.filter(_ => _.t == id))
	return buildingListList.get(id);
}
let buildingListList = new Map();
function buildingAmt(id) {
	return buildingList(id).length;
}
function costAmt(id) {
	id = Number(id);
	return buildingAmt(id) + buildingList(1).filter(b => b.meta.building == id).length;
}

const Building = {
	startPlacing(id) {
		let building = BUILDINGS[id];
		if (!Building.canAffordCost(id)) return;
		if (queue() > queueMax() - 1) return;
		if (!building.canBuild) return;
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
		if (queue() > queueMax() - 1) return;
		if (!b.canBuild) return;
		if (!b.currency.use(b.cost)) return;

		if (b.onPlace) b.onPlace(x, y);

		let pushedB = {level: 0, pos: {x, y}, meta: {building: placeData.node}, time: D(0), t: 1, upgrading: false};

		player.buildings.push(pushedB);
		if (buildingListList.get(1)) {
			buildingListList.get(1).push(pushedB);
		}
		map[x][y] = {t: 1};
		if (!player.options.buildMultiple && !controls.shift) placeData.node = "";
		render();
		renderLayer1();
		updateTileUsage();
		player.unlocks.built = true;
	},
	stopConstruction(x, y) {
		Modal.close();
		let type = Building.getByPos(x, y).meta.building;
		let id = Building.getByPos(x, y, true);
		let building = BUILDINGS[type];
		player.buildings.splice(id, 1);
		buildingListList.delete(1);
		buildings.delete(x*10000 + y);
		Currency[building.currencyName].amt = Currency[building.currencyName].amt.add(building.cost);
		map[x][y] = {t: 0}
		canvas.need0update = true;
		updateTileUsage();
	},
	sell(x, y) {
		if (Modal.showing && Modal.data.bindData.isBuilding)
			Modal.close();
		let building = Building.getByPos(x, y);
		let b = BUILDINGS[building.t];
		if (b.onSell) b.onSell(x, y);

		player.buildings.splice(Building.getByPos(x, y, true), 1);
		buildings.delete(x*10000 + y);
		buildingListList.delete(building.t);
		player.currency[b.currencyName] = player.currency[b.currencyName].add(b.cost.mul(0.8));
		map[x][y] = {t: 0};
		canvas.need0update = true;
		canvas.need1update = true;
		updateTileUsage();
	},

	level(x, y) {
		if (!player.unlocks.level) return;
		let b = Building.getByPos(x, y);
		let cBD = BD[b.t];
		if (cBD.currency.amt.lt(cBD.levelCost(b.level))) return;
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
		cBD.currency.use(cBD.levelCost(b.level));
		b.upgrading = true;
		canvas.need0update = true;
		canvas.need1update = true;
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
				Modal.data.buttons = [];
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
				return id ? player.buildings.indexOf(i) : i;
			}
		}
	},

	canAffordCost(id) {
		let b = BD[id];
		return b.currency.amt.gte(b.cost);
	},
	canAffordLevel(id, lvl) {
		let b = BD[id];
		return !!(b.levelCost) && b.currency.amt.gte(b.levelCost(lvl));
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
				'disabled': player.currency[building.currencyName].lt(building.cost) || queue() >= queueMax() || !building.canBuild
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
	let base = 2;
	base = base + player.builders;
	return base;
}
// Map From Building
function mfb(b) {
	return map[b.pos.x][b.pos.y];
}