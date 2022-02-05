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

function trail(num, digits, base) {
	num = Number(num);
	let neg = Math.sign(num) == -1;
	return (neg ? "-" : "") + (('0').repeat(digits) + Math.trunc(Math.abs(num)).toString(base)).slice(-digits);
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
	if (d || h) timeString += `${trail(h, 2)}:`;
	if (d || h || m) timeString += `${trail(m, 2)}:`;
	timeString += `${num.gte(10) ? ((h || d || m) ? trail(s, 2) : Math.trunc(s)) : format(s, 2)}${num < 60 ? "s" : ""}`;
	return timeString;
}