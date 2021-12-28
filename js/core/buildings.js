const BUILDINGS = {}

let placeData = {
	facing: 0,
	nodeType: "tile",
	node: ""
}

const Building = {
	startPlacing(id) {
		let building = BUILDINGS[id];
		if (building.cost.gt(player.currency[building.currencyInternalName])) return;
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
			player.loreUnlocks.place = true;
		}
		placeData.node = id;
		renderLayer1();
		if (Research.has("access", 2)) canvas.need0update = true;
	},
	stopPlacing() {
		if (!placeData.node) return;
		let b = BUILDINGS[placeData.node];
		let [x, y] = getXYfromDir(placeData.facing);

		if (!b.canPlace(x, y)) return;

		if (b.onPlace) b.onPlace(x, y);

		player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].sub(b.cost);

		player.buildingAmt[placeData.node] = player.buildingAmt[placeData.node].add(1);
		player.buildings[placeData.node].push({pos: {x, y}, meta: b.startMeta(x, y)});
		if (placeData.nodeType == "tile") {
			map[x][y][0] = placeData.node;
		}
		if (!player.options.buildMultiple) placeData.node = "";
		render();
		renderLayer1();
		updateTileUsage();
	},
	sell(x, y, type) {
		Modal.close();
		let b = BUILDINGS[type];
		if (b.onSell) b.onSell(x, y);

		player.buildings[type].splice(Building.getByPos(x, y, type, true), 1);
		player.buildingAmt[type] = player.buildingAmt[type].sub(1);
		player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].add(b.cost.mul(0.8));
		map[x][y] = {t: 0};
		canvas.need0update = true;
		updateTileUsage();
	},
	getByPos(x, y, type, id=false) {
		if (id) {
			for (let i in player.buildings[type]) {
				if (player.buildings[type][i].pos.x == x && player.buildings[type][i].pos.y == y) return i;
			}
		}
		for (let i of player.buildings[type]) {
			if (i.pos.x == x && i.pos.y == y) return i;
		}
	},
	load() {
		Vue.component("building-ui", {
			props: ["bId", "type"],
			data: () => { return {
				player,
				BUILDINGS,
				SPECIAL_CHARS,
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
				'locked': player.currency[building.currencyInternalName].lt(building.cost) ||
				player.attributes.powerUsed.add(building.power).gt(player.attributes.power)
			}" @click="Building.startPlacing(bId, type)">
				<span style="width: 50px;">
					&nbsp;
					<span :style="{color: tileStyle[bId]}" class="buildingImg">{{bId}}</span>
					&nbsp;
				</span>
				<span v-html="building.name + ': ' + building.desc" style="width: 600px; font-size: 16px; text-align: left;"></span>
				<span style="width: 90px; font-size: 18px;">
					<div style="margin-left: 5px; text-align: left;">
						{{format(building.cost, 0)}}
						<span :class="{curr: true, [building.currencyInternalName]: true}">
							{{building.currencyDisplayName}}
						</span>
						<div v-if="building.power.gt(0)">
							<span class="mid">{{format(building.power, 0)}}</span> <span class="curr power"></span>
						</div>
					</div>
				</span>
			</div>`
		})
	}
}