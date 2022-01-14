function format(num, precision = 2, precisionAfter = 2, small = false) {
	num = D(num);
	let e = num.e, m = num.m;
	if (m >= 9.995) {
		m = 1;
		e++;
	}
	if (e > 1e15) return "Infinity";
	if (e < -3 && small) return `${m.toFixed(precisionAfter)}e${formatWhole(e)}`;
	if (num.abs() < 1e6) return Number(num).toFixed(precision);
	return `${m.toFixed(precisionAfter)}e${formatWhole(e)}`
}

function formatWhole(num) {
	num = D(num);
	if (num.e < 0 || num.e > 5) return format(num);
	num = num.floor();
	if (num.e > 1e15) return "Infinity";
	if (num.e < 5) return num.toFixed(0);
	return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTime(num) {
	num = D(num);
	if (num.e > 1e15) return "Infinite time";
	if (num >= 86400000000) {
		return `${format(num.div(86400))} d`
	}
	let d = Math.floor(num/86400), h = Math.floor(num/3600)%24, m = Math.floor(num/60)%60, s = num%60;
	let timeString = "";
	if (d > 0) timeString += `${d}d `;
	if (d > 0 || h > 0) timeString += `${d > 0 ? ('0' + h).slice(-2) : h}h `;
	if (d > 0 || h > 0 || m > 0) timeString += `${(h > 0 || d > 0) ? ('0' + m).slice(-2) : m}m `;
	timeString += `${num.gte(10) ? ((h > 0 || d > 0 || m > 0) ? ('0' + format(Math.floor(s), 0)).slice(-2) : format(Math.floor(s), 0)) : format(s, 2)}s`;
	return timeString;
}