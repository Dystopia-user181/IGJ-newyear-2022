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
	if (num.e < -1) return format(num);
	num = D(num).floor();
	if (num.e < 5) return num.toString();
	return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTime(num) {
	num = D(num);
	if (num > 9e15) {
		return `${format(num.div(86400))}d`
	}
	let d = Math.floor(num/86400), h = Math.floor(num/3600)%24, m = Math.floor(num/60)%60, s = num%60;
	let timeString = "";
	if (d > 0) timeString += `${d}d `;
	if (d > 0 || h > 0) timeString += `${h}h `;
	if (d > 0 || h > 0 || m > 0) timeString += `${m}m `;
	timeString += `${formatWhole(s)}s`;
	return timeString;
}