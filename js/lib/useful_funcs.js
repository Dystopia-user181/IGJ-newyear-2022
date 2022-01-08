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
		if (pureObjRef(thing[i]))
			val[i] = deepcopy(thing[i]);
		else
			val[i] = thing[i];
	}
	return val;
}

function deepcopyto(obj1, obj2) {
	for (let i in obj1) {
		if (pureObjRef(obj1[i]) && pureObjRef(obj2[i]))
			deepcopyto(obj1[i], obj2[i]);
		else
			obj2[i] = obj1[i];
	}
}

function pureObjRef(x) {
	return x && (x.constructor == Object || Array.isArray(x));
}