const GameUI = {
	update() {
		for (const handler of this.handlers) {
			hander.func();
		}
	},
	addHandler(func, x) {
		this.handlers.push({
			func: func.bind(x),
			target: x
		});
	}
	removeTargeted(x) {
		this.handlers = this.handlers.filter(handler => x !== handler.target);
	},
	handlers: []
}