const ITEMS = {
	coal: {
		displayName: "Coal",
		texture: "images/alchemy/coal.png"
	},
	copperOre: {
		displayName: "Copper Ore",
		texture: "images/alchemy/copperore.png"
	},
	copperIngot: {
		displayName: "Copper Ingot",
		texture: "images/alchemy/copperingot.png"
	},
	tinOre: {
		displayName: "Tin Ore",
		texture: "images/alchemy/tinore.png"
	},
	tinIngot: {
		displayName: "Tin Ingot",
		texture: "images/alchemy/tiningot.png"
	}
}
const Items = {
	insertToInventory(type, x, inventory = player.alchemy.inventory) {
		x = D(x);
		if (x.lte(0)) return;
		// Has same item
		for (let row in inventory) {
			for (let col in inventory[row]) {
				cell = inventory[row][col];
				if (cell.type == type && cell.amt.gt(0)) {
					cell.amt = cell.amt.add(x);
					return;
				}
			}
		}
		// Doesn't have any of the same item
		for (let row in inventory) {
			for (let col in inventory[row]) {
				cell = inventory[row][col];
				if (cell.amt.lte(0)) {
					cell.amt = x;
					cell.type = type;
					return;
				}
			}
		}
	},
	clickToInventory() {
		Items.insertToInventory(this.slot.type, this.slot.amt.floor());
		this.slot.amt = this.slot.amt.sub(this.slot.amt.floor());
	},
	load() {
		Vue.component("inventory-display", {
			props: ["inv", "data"],
			template: `
			<div class="col centre" style="display: inline-block;">
				<div class="centre" v-for="row in inv">
					<item-slot v-for="cell in row" :invSlot="cell" :data="data"/>
				</div>
			</div>`
		})
		Vue.component("item-slot", {
			props: ["data", "invSlot"],
			data() { return {
				ITEMS
			}},
			methods: {
				formatWhole,
				clickHandler() {
					if (this.data.readOnly) return;
					if (this.data.clickHandler) {
						this.data.clickHandler.bind(this)(); return
					}
					let hold = player.alchemy.holding;
					if (hold.amt.gt(0))
						if (hold.type == this.slot.type)
							this.allToSlot();
						else
							this.switchWithSlot();
					else
						this.allToHand();
				},
				rClickHandler(e) {
					e.preventDefault();
					if (this.data.readOnly) return;
					if (this.data.rClickHandler) {
						this.data.rClickHandler.bind(this)(); return
					}
					let hold = player.alchemy.holding;
					if (hold.amt.gt(0))
						if (hold.type == this.slot.type)
							this.oneToSlot();
						else
							this.switchWithSlot();
					else
						this.halfToHand();
				},
				allToSlot() {
					let hold = player.alchemy.holding;
					this.slot.amt = this.slot.amt.add(hold.amt);
					hold.amt = D(0);
				},
				allToHand() {
					let hold = player.alchemy.holding;
					({type: hold.type, amt: hold.amt} = this.slot);
					this.slot.amt = D(0);
				},
				halfToHand() {
					let hold = player.alchemy.holding;
					hold.type = this.slot.type;
					hold.amt = this.slot.amt.div(2).ceil();
					this.slot.amt = this.slot.amt.div(2).floor();
				},
				oneToSlot() {
					let hold = player.alchemy.holding;
					this.slot.amt = this.slot.amt.add(1);
					hold.amt = hold.amt.sub(1);
				},
				switchWithSlot() {
					let hold = player.alchemy.holding;
					[this.slot.type, this.slot.amt, hold.type, hold.amt] =
					[hold.type, hold.amt, this.slot.type, this.slot.amt]
				}
			},
			computed: {
				slot() {return this.invSlot;}
			},
			template: `<div class="inventory-slot centre" @click="clickHandler" @contextmenu="rClickHandler">
				<item-display :type="slot.type" :amt="slot.amt"></item-display>
				<div class="inventory-tooltip" v-if="slot.amt.floor().gt(0)">
					{{ITEMS[slot.type].displayName}} x{{formatWhole(slot.amt.floor())}}
				</div>
			</div>`
		});
		Vue.component("item-display", {
			props: ["type", "amt"],
			data() { return {
				ITEMS
			}},
			methods: {
				formatWhole
			},
			template: `<div style="width: 35px; height: 35px; position: relative;" v-if="amt.floor().gt(0)">
				<img :src="ITEMS[type].texture" width="35" height="35"/>
				<span style="bottom: -10px; right: -10px; position: absolute; font-size: 14px;">
					{{formatWhole(amt.floor())}}
				</span>
			</div>`
		});
	}
}