function detectMobile() {
	const toMatch = [
		/Android/i,
		/webOS/i,
		/iPhone/i,
		/iPad/i,
		/iPod/i,
		/BlackBerry/i,
		/Windows Phone/i,
	];

	return toMatch.some(toMatchItem => navigator.userAgent.match(toMatchItem));
}

function simulateKeypress(key, type, shiftKey = false, ctrlKey = false) {
	window.dispatchEvent(
		new KeyboardEvent(`key${type}`, { key, shiftKey, ctrlKey })
	);
}

let isMobile;
function loadMobile() {
	isMobile = detectMobile();
}