function randomNoiseBit() {
	s += v;
	return (s%d)/d
}
let d = 7919;
let v = 1299709;
let s = 0;

function Noise(x, y, scalar=1) {
	let map = [];
	for (let i = 0; i < x; i++) {
		map.push([]);
		for (let j = 0; j < y; j++) {
			map[i][j] = randomNoiseBit()*scalar;
		}
	}
	return map;
}

function Lerp1d(px, py, pp) {
	let f = 0.5 - Math.cos(pp/Math.PI)*0.5
	return px*(1 - f) + py*f;
}
function Lerp(noise, interval) {
	let lerpX = [], lerpXPrim = [];
	let w = noise.length*interval - interval;
	let lerpY = [], lerpYPrim = [];
	let h = noise[0].length*interval - interval;

	let c = 1/interval;

	for (let i = 0; i < noise.length; i++) {
		lerpXPrim.push([]);
		for (let j = 0; j <= w; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpXPrim[i][j] = noise[i][j*c];
			else {
				let p = Math.floor(j*c);
				lerpXPrim[i][j] = Lerp1d(noise[i][p], noise[i][p + 1], lerpPos/c);
			}
		}
	}
	for (let i = 0; i < noise[0].length; i++) {
		lerpYPrim.push([]);
		for (let j = 0; j <= h; j++) {
			let lerpPos = j%interval;
			if (lerpPos == 0) lerpYPrim[i][j] = noise[j*c][i];
			else {
				let p = Math.floor(j*c);
				lerpYPrim[i][j] = Lerp1d(noise[p][i], noise[p + 1][i], lerpPos/c);
			}
		}
	}

	for (let i = 0; i <= h; i++) {
		lerpX.push([]);
		for (let j = 0; j <= w; j++) {
			if (i%interval == 0) lerpX[i][j] = lerpXPrim[i*c][j];
			else {
				let lerpPos = j%interval;
				if (lerpPos == 0) {
					lerpX[i][j] = lerpYPrim[j*c][i];
				}
				else {
					let p = Math.floor(j*c)
					lerpX[i][j] = Lerp1d(lerpYPrim[p][i], lerpYPrim[p + 1][i], lerpPos/c);
				}
			}
		}
	}
	for (let i = 0; i <= h; i++) {
		lerpY.push([]);
		let lerpPos = i%interval;
		for (let j = 0; j <= w; j++) {
			if (j%interval == 0) lerpY[i][j] = lerpYPrim[j*c][i];
			else {
				if (lerpPos == 0) lerpY[i][j] = lerpXPrim[i*c][j];
				else {
					let p = Math.floor(i*c)
					lerpY[i][j] = Lerp1d(lerpYPrim[p][j], lerpYPrim[p + 1][j], lerpPos/c);
				}
			}
		}
	}

	return lerpX.map((arr, x) => {
		return arr.map((val, y) => {
			return (val + lerpY[x][y])/2;
		})
	})
}