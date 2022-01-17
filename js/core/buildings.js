const BUILDINGS = {
	2: {
		name: "Gold Mine",
		desc: "Produces <span class='money'>$</span> 0.75/s.",
		get cost() {
			if (costAmt(2) >= 96 || player.iridite.newBuildings) {
				return D(Infinity);
			}
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
			if (lvl > 7) return D(Infinity);

			return Decimal.pow(10, Math.pow(lvl, (lvl > 6) ? 1.21 : 1.19855)).mul(100 + 100*(lvl > 4) + 3e4*(lvl > 5)).floor();
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
			if (lvl == 6) return D(172800);
			if (lvl == 7) return D(3456000);
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
			return BD[2].levelScaling(b.level).mul(0.75*(1 + enhancers*3)).mul(tmp.anti.essenceEffect);
		},
		canBuild: true
	},
	3: {
		name: "Essence Collector",
		desc: "Produces <span class='essence'>*</span> 0.05/s.",
		get cost() {
			if (costAmt(3) >= 48 || player.iridite.newBuildings || player.base.newBuildings < 1) return D(Infinity);
			return Decimal.pow(1.5, Math.pow(costAmt(3), 1.2)).mul(1e3).floor();
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(15),
		levelCost(lvl) {
			if (lvl > 4 || player.base.newBuildings < 1) return D(Infinity);

			return Decimal.pow(40, Math.pow(lvl, 1.2)).mul(5e5 + 9.5e6*(lvl > 2));
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(10);

			return Decimal.pow(4, lvl).mul(2.25 + 12*(lvl > 2) + 120*(lvl > 3));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(30);
			if (lvl == 1) return D(90);
			if (lvl == 2) return D(10800);
			if (lvl == 3) return D(172800);
			if (lvl == 4) return D(3456000);
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
			return BD[3].levelScaling(b.level).mul(0.05*(1 + enhancers*3)).mul(tmp.anti.moneyEffect);
		},
		get canBuild() {
			return player.base.newBuildings > 0;
		}
	},
	4: {
		name: "Enhancer",
		get desc() {
			return `Increases efficiency of
			${(Research.has("rep3") || Research.has("rep4")) ? `${Research.has("rep4") ? "iridite drills " : ""}${(Research.has("rep3") && Research.has("rep4")) ? "and " : ""}${Research.has("rep3") ? "energizers " : ""}`
			: `gold mines${player.base.enhanceCollectors ? " and essence collectors" : ""}`} in a 3x3 area.<br>Does not stack.`;
		},
		get cost() {
			return D(Math.pow(costAmt(4)*0.6 + 1, 3)).mul(3).floor();
		},
		currencyName: "essence",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(20),
		get canBuild() {
			return player.base.newBuildings > 0;
		}
	},
	5: {
		get name() {
			if (player.base.newBuildings < 2) return "???";
			return "Antipoint";
		},
		get desc() {
			if (player.base.newBuildings < 2) return "???";
			return `Reverses time and gives buffs in return.<br>Do not place them within 6 tiles of each other.`;
		},
		get cost() {
			if (costAmt(5) > 3) return D(Infinity);
			return Decimal.pow(30, Math.pow(costAmt(5), 1.5)).mul(4e6);
		},
		currencyName: "essence",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(1800),
		getEffect(x, y) {
			let base = D(1);
			let nearby = 0;
			for (i of buildingList(5)) {
				if (distance([i.pos.x, i.pos.y], [x, y]) < 6.5)
					nearby++;
			}
			base = base.div(Math.sqrt(nearby));
			return base;
		},
		get canBuild() {
			return player.base.newBuildings > 1;
		}
	},
	6: {
		get name() {
			return `Iridite drill${(costAmt(6) <= 0 || Modal.data.bind != "construction-menu" || !Modal.showing) ? "" : `<i class="sub" style="font-size: 16px;"> &nbsp; Next requires ${Currency.orbs.text} ${formatWhole(BD[6].cost.log10().floor())}</i>`}`
		},
		get desc() {
			return `Produces <span class='money'>$</span> 5.00e9, <span class='essence'>*</span> 1.00e7, <span class='iridite'>Ø</span> 1.00e-6/s.<br>
			<i class="sub">Can only be placed on iridium reserves</i>`
		},
		get cost() {
			if (costAmt(6) <= 0) return D(0);
			if (costAmt(6) == 1) return D(1e18);
			return D(Infinity);
		},
		currencyName: "iridite",
		canPlace(x, y) {
			return checkTileAccess(x, y) && distance([x, y], [70, 70]) < 3.5;
		},
		startMeta(x, y) { return {
			charge: D(0),
			charging: false,
			timespeed: D(0)
		}},
		buildTime: D(3456000),
		levelCost(lvl) {
			if (lvl == 0) return D(3e7);
			if (lvl == 1) return D(1e56);
			return D(Infinity);
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(20);

			return Decimal.pow(300, lvl);
		},
		levelTime(lvl) {
			if (lvl == 0) return D(1.728e9);
			if (lvl == 1) return D(1.728e20);
			if (lvl == 2) return D(Infinity);
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
			let base = BD[6].levelScaling(b.level);
			base = base.mul(b.meta.charge.max(0).add(1).pow(0.25));
			base = base.mul(RS.triplerII.effect);
			if (Research.has("rep4")) base = base.mul(1 + 3*enhancers);
			let mbase = base.mul(b.meta.charge.add(1).pow(0.15)).mul(tmp.anti.essenceEffect);
			let ebase = base.mul(b.meta.charge.add(1).pow(0.15)).mul(tmp.anti.moneyEffect);
			let ibase = base.mul(RS.doublerI.effect).mul(Orbs.iriditeEffect());
			mbase = mbase.mul(RS.quintuplerI.effect).mul(Orbs.moneyEffect());
			ebase = ebase.mul(RS.quintuplerI.effect).mul(Orbs.essenceEffect());
			return [mbase.mul(5e9), ebase.mul(1e7), ibase.mul(1e-6)];
		},
		timespeed(x, y) {
			let b = Building.getByPos(x, y);
			if (b.upgrading) return D(0);
			if (!b.meta.timespeed) b.meta.timespeed = D(0);
			return b.meta.timespeed.pow(RS.acv2.effect).add(1).pow(1/RS.acv2.effect).sub(1);
		},
		get canBuild() {
			return costAmt(6) < 1 || Currency.orbs.amt.gte(BD[6].cost.log10().floor());
		}
	},
	7: {
		name: "Charger",
		desc: `Distributes charge to all laterally adjacent iridite drills.`,
		get cost() {
			return Decimal.pow(1e5, Math.pow(costAmt(7), 1.3)).mul(6e35);
		},
		currencyName: "essence",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {
			time: D(0),
			charging: false,
			paused: false
		}},
		buildTime: D(1.728e10),
		levelCost(lvl) {
			if (lvl == 0) return D(3.9e39);
			if (lvl == 1) return D(4.9e49)
			else return D(Infinity);
		},
		levelScaling(lvl) {
			return Decimal.pow(100, Math.pow(lvl, 0.95));
		},
		levelTime(lvl) {
			if (lvl == 0) return D(3.456e11);
			if (lvl == 1) return D(1.728e13);
			if (lvl == 2) return D(1e1000);
			if (lvl == 3) return D(120);
			if (lvl == 4) return D(1800);
			if (lvl == 5) return D(10800);
			if (lvl == 6) return D(172800);
			if (lvl == 7) return D(3456000);
		},
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			return D(b.level > 0 ? 0.1 : 1/15).mul(Orbs.energyEffect());
		},
		getEffect(x, y) {
			let b = Building.getByPos(x, y);
			return BD[7].levelScaling(b.level).mul(5e9);
		},
		getEffect2(x, y) {
			let b = Building.getByPos(x, y);
			return b.level > 1 ? D(5) : D(1024);
		},
		canBuild: true
	},
	8: {
		name: "Energizer",
		desc: `Creates ${Currency.orbs.text} when charged by a charger.`,
		get cost() {
			return Decimal.pow(1e8, Math.pow(costAmt(8), 1.8)).mul(1e46);
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {
			charge: D(0)
		}},
		buildTime: D(1.728e12),
		canBuild: true
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
		if (b.cost.gt(player.currency[b.currencyName])) return;
		if (queue() > queueMax() - 1) return;
		if (!b.canBuild) return;

		if (b.onPlace) b.onPlace(x, y);

		player.currency[b.currencyName] = player.currency[b.currencyName].sub(b.cost);

		player.buildings.push({level: 0, pos: {x, y}, meta: {building: placeData.node}, time: D(0), t: 1, upgrading: false});
		map[x][y] = {t: 1};
		if (!player.options.buildMultiple && !controls.shift) placeData.node = "";
		render();
		renderLayer1();
		updateTileUsage();
	},
	sell(x, y) {
		if (Modal.showing && Modal.data.bindData.isBuilding)
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
	let base = 1;
	base = base + player.builders;
	return base;
}
// Map From Building
function mfb(b) {
	return map[b.pos.x][b.pos.y];
}
