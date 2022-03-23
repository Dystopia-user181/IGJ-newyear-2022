Items.clickFunctions = {
	allToSlot(slot) {
		let hold = player.alchemy.holding;
		slot.amt = slot.amt.add(hold.amt);
		hold.amt = D(0);
	},
	allToHand(slot) {
		let hold = player.alchemy.holding;
		({type: hold.type, amt: hold.amt} = slot);
		slot.amt = D(0);
	},
	halfToHand(slot) {
		let hold = player.alchemy.holding;
		hold.type = slot.type;
		hold.amt = slot.amt.div(2).ceil();
		slot.amt = slot.amt.div(2).floor();
	},
	oneToSlot(slot) {
		let hold = player.alchemy.holding;
		slot.amt = slot.amt.add(1);
		hold.amt = hold.amt.sub(1);
	},
	switchWithSlot(slot) {
		let hold = player.alchemy.holding;
		[slot.type, slot.amt, hold.type, hold.amt] =
		[hold.type, hold.amt, slot.type, slot.amt];
	},


	defaultClickHandler(slot, this2) {
		let hold = player.alchemy.holding;
		if (hold.amt.lte(0) && slot.amt.lte(0)) return;
		let previous = {type: slot.type, amt: slot.amt};
		let unstackable = Item(slot).unstackable;
		if (hold.amt.gt(0))
			if (hold.type == slot.type && !unstackable)
				this.allToSlot(slot);
			else
				this.switchWithSlot(slot);
		else
			this.allToHand(slot);
		if (this2 && this2.data.onChange) this2.data.onChange.bind(this2)({
			previous,
			current: {type: this2.slot.type, amt: this2.slot.amt}
		});
	},
	defaultRClickHandler(slot, this2) {
		let hold = player.alchemy.holding;
		if (hold.amt.lte(0) && slot.amt.lte(0)) return;
		let previous = {type: slot.type, amt: slot.amt};
		let unstackable = Item(slot).unstackable;
		if (hold.amt.gt(0))
			if (hold.type == slot.type && !unstackable)
				this.oneToSlot(slot);
			else
				this.switchWithSlot(slot);
		else
			this.halfToHand(slot);
		if (this2 && this2.data.onChange) this2.data.onChange.bind(this2)({
			previous,
			current: {type: this2.slot.type, amt: this2.slot.amt}
		});
	}
}

Items.loadVue = function() {
	Vue.component("inventory-display", {
		props: ["inv", "data"],
		template: `
		<div class="col centre" style="display: inline-block;">
			<div class="centre" v-for="row in inv">
				<item-slot v-for="cell in row" :invslot="cell" :data="data"/>
			</div>
		</div>`
	})
	Vue.component("item-slot", {
		props: ["data", "invslot", "tooltip"],
		data() { return {
			ITEMS,
			mouseX: 0,
			mouseY: 0
		}},
		methods: {
			formatWhole,
			clickHandler() {
				if (this.data.readOnly) return;
				if (this.data.clickHandler) {
					this.data.clickHandler.bind(this)(); return
				}
				Items.clickFunctions.defaultClickHandler(this.slot, this);
				if (this.data.afterClick)
					this.data.afterClick.bind(this)();
			},
			rClickHandler(e) {
				e.preventDefault();
				if (this.data.readOnly) return;
				if (this.data.rClickHandler) {
					this.data.rClickHandler.bind(this)(); return
				}
				Items.clickFunctions.defaultRClickHandler(this.slot, this);
				if (this.data.afterRClick)
					this.data.afterRClick.bind(this)();
			},
			handleTooltip(e) {
				this.mouseX = e.clientX - this.$refs.slot.getBoundingClientRect().x + 5;
				this.mouseY = e.clientY - this.$refs.slot.getBoundingClientRect().y + 5;
			}
		},
		computed: {
			slot() {return this.invslot;},
			trueTooltip() {
				return this.tooltip || ITEMS[this.slot.type].displayName
			}
		},
		template: `<div class="inventory-slot centre" @click="clickHandler" @contextmenu="rClickHandler"
		ref="slot" @mousemove="handleTooltip">
			<item-display :type="slot.type" :amt="slot.amt"></item-display>
			<div class="inventory-tooltip" v-if="slot.amt.floor().gt(0)" v-html="trueTooltip"
			:style="{
				top: mouseY + 'px',
				left: mouseX + 'px'
			}"></div>
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
			<span style="bottom: -8px; right: -5px; position: absolute; font-size: 14px;" v-if="amt.gte(2)">
				{{formatWhole(amt.floor())}}
			</span>
		</div>`
	});
}