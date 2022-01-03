const BUILDINGS = {
	2: {
		name: "Gold Mine",
		desc: "Produces <span class='money'>$</span> 0.5/s.",
		get cost() {
			return Decimal.pow(1.5, Math.pow(costAmt(2), 1.2)).mul(10).floor();
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(5),
		levelCost(lvl) {
			if (lvl > 2) return D(Infinity);

			return Decimal.pow(10, Math.pow(lvl, 1.2)).mul(100);
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(5);

			return D(4*lvl);
		},
		levelTime(lvl) {
			if (lvl == 0) return D(20);
			return D(80);
		}
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
		if (queue() > 0) return;
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
		canvas.need0update = true;
		updateTileUsage();
	},
	level(x, y) {
		if (!player.unlocks.level) return;
		let b = Building.getByPos(x, y);
		let cBD = BD[b.t];
		if (Currency[cBD.currencyName].amt.lt(cBD.levelCost(b.level))) return;
		if (queue() > 0) {
			let currentModal = deepcopy(Modal.data);
			let prevCloseFunc = Modal.closeFunc;
			Modal.show({
				title: "Warning",
				text: "Building queue is full (" + queue() + "/1)",
				buttons: [{
					text: "Back",
					onClick() {
						Modal.closeFunc();
					}
				}],
				close() {
					deepcopyto(currentModal, Modal.data);
					Modal.closeFunc = prevCloseFunc;
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
		if (id) {
			for (let i in player.buildings) {
				if (player.buildings[i].pos.x == x && player.buildings[i].pos.y == y) return i;
			}
		}
		for (let i of player.buildings) {
			if (i.pos.x == x && i.pos.y == y) return i;
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
			computed: {
				building() {
					return BUILDINGS[this.bId]
				}
			},
			template: `<div :class="{
				'building-segment': true,
				'disabled': player.currency[building.currencyName].lt(building.cost) || queue() > 0
			}" @click="Building.startPlacing(bId, type)">
				<span style="width: 5px;"></span>
				<span style="width: 600px;">
					<span v-html="building.name" style="font-size: 22px;"></span><br>
					<span v-html="building.desc" style="font-size: 15px; text-align: left;"></span>
				</span>
				<span style="width: 90px; font-size: 18px;">
					<div style="margin-left: 5px; text-align: left;">
						<component :is="building.currencyName + '-display'" :amt="building.cost" whole="a"></component>
					</div>
				</span>
			</div>`
		})
	}
}

function queue() {
	return buildingAmt(1) + player.buildings.filter(i => i.upgrading).length;
}
// Map From Building
function mfb(b) {
	return map[b.pos.x][b.pos.y];
}