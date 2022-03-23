SmeltHandler.loadVue = function() {
	Vue.component("temperature-display", {
		props: ["furnace"],
		computed: {
			inputType() {
				return Item(this.furnace.input);
			}
		},
		template: `<span>
			Current temperature: {{format(furnace.temperature)}}°C<br>
			<span v-if="furnace.input.amt.gt(0) && inputType.canSmelt"
			:style="{ color: inputType.smeltingRecipe.canSmelt(furnace.temperature) ? '#fff' : '#f00' }">
				Required temperature: {{inputType.smeltingRecipe._config.temperatureRange}}°C
			</span>
			<br><br>
		</span>`
	});

	Vue.component("furnace-input-display", {
		props: ["furnace"],
		data() { return {
			player,
			flameText: "/\\/\\/\\"
		}},
		methods: {
			onChange(e) {
				if (e.previous.type != e.current.type)
					this.furnace.smeltTime = D(0);
			},
			Item
		},
		template: `<div class="col centre">
			<item-slot :invslot="furnace.input" :data="{
				onChange
			}" />

			<div style="position: relative">
				<div style="visibility: hidden;">{{flameText}}</div>

				<div :style="{
					position: 'absolute',
					top: 0, left: 0, 'z-index': 2,
					color: '#f80',
					'clip-path': \`
					inset(\${100 - furnace.fuelCurrentlyBurning.mul(100).div(furnace.lastUsedFuelEfficiency)}% 0% 0% 0%)\`
				}">{{flameText}}</div>
				<div style="position: absolute; color: var(--bg-3); top: 0; left: 0;">
					{{flameText}}
				</div>
			</div>

			<item-slot :invslot="furnace.fuel" :data="{
				readOnly: !Item(player.alchemy.holding).isFuel && player.alchemy.holding.amt.gt(0)
			}" />
		</div>`
	});

	Vue.component("furnace-output-display", {
		props: ["furnace"],
		template: `<div>
			<inventory-display :inv="furnace.outputs" :data="{}"/>
		</div>`
	});

	Vue.component("furnace-ui", {
		props: ["furnace"],
		template: `<div style="padding: 10px; background-color: var(--bg-2);">
			<temperature-display :furnace="furnace" />

			<div class="centre">
				<furnace-input-display :furnace="furnace" />

				<span> &nbsp; </span>
				<span :style="{
					'clip-path': \`
					inset(0% \${100 - furnace.smeltTime.mul(100)}% 0% 0%)\`
				}">---&gt; </span>
				<span>&nbsp; </span>

				<furnace-output-display :furnace="furnace"/>
			</div>
		</div>`
	})
}