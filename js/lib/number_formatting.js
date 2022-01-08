function format(num, precision = 2, precisionAfter = 3, small = false) {
	num = D(num);
	if (num.e > 1e15) return "Infinity";
	if (num.e < -3 && small) return `${num.m.toFixed(precisionAfter)}e${formatWhole(num.e)}`;
	if (num.abs() < 1e6) return Number(num).toFixed(precision);
	let e = num.e, m = num.m;
	if (m >= 9.995) {
		m = 1;
		e++;
	}
	return `${num.m.toFixed(precisionAfter)}e${formatWhole(num.e)}`
}

function formatWhole(num) {
	num = D(num);
	if (num.e < 0 || num.e > 5) return format(num);
	num = num.floor();
	if (num.e > 1e15) return "Infinity";
	if (num.e < 5) return num.toString();
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTime(num) {
	num = D(num);
	if (num.e > 1e15) return "Infinite time";
	if (num > 9e15) {
		return `${format(num.div(86400))}d`
	}
	let d = Math.floor(num/86400), h = Math.floor(num/3600)%24, m = Math.floor(num/60)%60, s = num%60;
	let timeString = "";
	if (d > 0) timeString += `${d}d `;
	if (d > 0 || h > 0) timeString += `${h}h `;
	if (d > 0 || h > 0 || m > 0) timeString += `${m}m `;
	timeString += `${num.gte(10) ? format(Math.floor(s), 0) : format(s, 2)}s`;
	return timeString;
}