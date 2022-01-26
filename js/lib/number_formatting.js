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

function trail(num, digits) {
	num = Number(num);
	let s = Math.sign(num);
	return (s == -1 ? "-" : "") + ('00000000000000000000000000000000000' + Math.round(Math.abs(num))).slice(-digits);
}
function formatTime(num) {
	num = D(num);
	if (num.e > 1e15) return "Infinite time";
	if (num >= 86400000000) {
		return `${format(num.div(86400))} d`
	}
	let d = Math.trunc(num/86400), h = Math.trunc(num/3600)%24, m = Math.trunc(num/60)%60, s = num%60;
	let timeString = "";
	if (d) timeString += `${d}d `;
	if (d || h) timeString += `${d ? trail(h, 2) : h}h `;
	if (d || h || m) timeString += `${(h || d) ? trail(m, 2) : m}m `;
	timeString += `${num.gte(10) ? ((h || d || m) ? trail(s, 2) : Math.trunc(s)) : format(s, 2)}s`;
	return timeString;
}