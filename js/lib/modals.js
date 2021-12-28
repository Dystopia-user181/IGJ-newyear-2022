const Modal = {
	load() {
		Vue.component('modal', {
			data: () => { return {
				Modal
			}},
			template: `<div class="modal" v-if="Modal.showing" :style='Modal.data.style'>
				<div class="modal-top">
					<div style="border-right: 2px solid #fff; height: 40px; position: relative; width: 40px;"
					onclick="Modal.closeFunc()">
						<div style="position: absolute; width: 30px; transform: translate(5px, 17.5px) rotate(45deg); height: 5px; background-color: var(--c1)"></div>
						<div style="position: absolute; width: 30px; transform: translate(5px, 17.5px) rotate(-45deg); height: 5px; background-color: var(--c1)"></div>
					</div>
					<span v-html="Modal.data.title" style="padding-left: 7px; font-size: 20px"></span>
				</div>
				<div v-if="Modal.data.bind" :is="Modal.data.bind" :data="Modal.data.bindData"></div>
				<div v-else v-html="Modal.data.text" style="text-align: center; padding: 10px"></div>
				<div style="position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); text-align: center">
					<button v-for="btn in Modal.data.buttons" @click="btn.onClick" style="min-width: 75px; margin: 0 5px">{{btn.text}}</button>
				</div>
			</div>`
		})
	},
	show({title, text="", bind="", bindData={}, style={}, buttons=[], close=function () {Modal.close()}}) {
		Modal.data.title = title;
		Modal.data.text = text;
		Modal.data.bind = bind;
		Modal.data.bindData = bindData;
		Modal.data.buttons = buttons;
		Modal.data.style = style;
		Modal.closeFunc = close;
		Modal.showing = true;
		darknessTooltip = [];
		renderLayer2();
	},
	close() {
		Modal.showing = false;
	},
	closeFunc() {
		Modal.close();
	},
	showing: false,
	data: {
		title: "",
		text: "",
		bind: "",
		buttons: [],
		style: {}
	}
};