function format(num, precision = 2, precisionAfter = 3) {
	num = D(num);
	if (num < 1e6) return Number(num).toFixed(precision);
	let e = num.e, m = num.m;
	if (m >= 9.995) {
		m = 1;
		e++;
	}
	return `${num.m.toFixed(precisionAfter)}e${formatWhole(num.e)}`
}

function formatWhole(num) {
	num = D(num).floor();
	if (num.e < 5) return num.toString();
	return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}