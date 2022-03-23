function distance([x1, y1], [x2, y2]) {
	return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
}
function distSq([x1, y1], [x2, y2]) {
	return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2)
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
	let val = new thing.constructor();
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

Array.prototype.mapToObject = function(keyFun, valueFun) {
  if (typeof keyFun !== "function" || typeof valueFun !== "function")
    throw "keyFun and valueFun must be functions";
  let out = {}
  for (let idx = 0; idx < this.length; ++idx) {
    out[keyFun(this[idx], idx)] = valueFun(this[idx], idx);
  }
  return out;
}

//Object.prototype.map = function(valueFun) {
//	let out = {};
//	for (let idx in this) {
//		out[idx] = valueFun(this[idx], idx);
//	}
//	return out;
//}