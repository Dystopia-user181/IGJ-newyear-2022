function distance([x1, y1], [x2, y2]) {
	return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}
function distGrid([x1, y1], [x2, y2]) {
	return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
function polysoft(v, s, m=0.5) {
	v = D(v);
	s = D(s);
	if (v.lte(s)) return v;
	else return s.mul(Decimal.pow(v.div(s), m));
}

function deepcopy(thing) {
	return JSON.parse(JSON.stringify(thing));



	val = new thing.constructor();
	for (let i in thing) {
		if (thing[i].constructor == Object || Array.isArray(thing[i]))
			val[i] = deepcopy(thing[i]);
		else
			val[i] = thing[i];
	}
	return val;
}