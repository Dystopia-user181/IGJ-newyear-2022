const BUILDINGS = {
	2: {
		name: "Gold Mine",
		desc: "Produces <span class='money'>$</span> 1/s.",
		get cost() {
			return Decimal.pow(1.5, Math.pow(costAmt(2), 1.2)).mul(10).floor();
		},
		currencyName: "money",
		canPlace(x, y) {
			return checkTileAccess(x, y);
		},
		startMeta(x, y) { return {} },
		buildTime: D(5)
	}
}

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
	return buildingAmt(id) + player.buildings.filter(_ => _.t == 1 && _.meta.building == id);
}

const Building = {
	startPlacing(id) {
		let building = BUILDINGS[id];
		if (building.cost.gt(player.currency[building.currencyName])) return;
		if (buildingAmt(1) > 0) return;
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
					Use wasd to move around as normal, and shift+wasd to rotate the building in your place.<br>
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

		player.buildings.push({level: 0, pos: {x, y}, meta: {building: placeData.node}, time: D(0), t: 1});
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
				'locked': player.currency[building.currencyName].lt(building.cost)
			}" @click="Building.startPlacing(bId, type)">
				<span style="width: 5px;"></span>
				<span style="width: 600px;">
					<span v-html="building.name" style="font-size: 22px;"></span><br>
					<span v-html="building.desc" style="font-size: 15px; text-align: left;"></span>
				</span>
				<span style="width: 90px; font-size: 18px;">
					<div style="margin-left: 5px; text-align: left;">
						<component :is="building.currencyName + '-display'" :amt="building.cost"></component>
					</div>
				</span>
			</div>`
		})
	}
}

// Map From Building
function mfb(b) {
	return map[b.pos.x][b.pos.y];
}