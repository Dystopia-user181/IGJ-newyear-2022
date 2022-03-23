Crafting.loadVue = function() {
	Vue.component("crafting-set", {
		props: ["set"],
		data() { return {
			Crafting
		}},
		template: `<div>
			<crafting-recipe v-for="recipe in Crafting[set]" />
		</div>`
	});
}