const IRIDITEDRILL = {
	buildingData: {
		get name() {
			return `Iridite drill${(costAmt(6) <= 0 || Modal.data.bind != "construction-menu" || !Modal.showing) ? "" : `<i class="sub" style="font-size: 16px;"> &nbsp; Next requires ${Currency.orbs.text} ${formatWhole(BD[6].cost.log10().floor())}</i>`}`
		},
		get desc() {
			return `Produces <span class='money'>$</span> 5.00e9, <span class='essence'>*</span> 1.00e7, <span class='iridite'>Ø</span> 1.00e-6/s.<br>
			<i class="sub">Can only be placed on iridium reserves</i>`
		},

		get cost() {
			if (costAmt(6) <= 0) return D(0);
			if (costAmt(6) == 1) return D(1e18);
			return D(Infinity);
		},
		currencyName: "iridite",
		buildTime: D(3456000),

		canPlace(x, y) {
			return checkTileAccess(x, y) && distance([x, y], [20, 20]) < 3.5;
		},
		get canBuild() {
			return costAmt(6) < 1 || Currency.orbs.amt.gte(BD[6].cost.log10().floor());
		},
		startMeta(x, y) { return {
			charge: D(0),
			charging: false,
			timespeed: D(0),
			depth: 0,
			inventory: newObjGrid(3, 6, () => { return {
				type: "coal",
				amt: D(0)
			}})
		}},

		levelCost(lvl) {
			if (lvl == 0) return D(3e7);
			if (lvl == 1) return D(1e56);
			return D(Infinity);
		},
		levelScaling(lvl) {
			if (lvl == 0) return D(1);
			if (lvl == 1) return D(20);

			return Decimal.pow(300, lvl);
		},
		levelTime(lvl) {
			if (lvl == 0) return D(1.728e9);
			if (lvl == 1) return D(1.728e20);
			if (lvl == 2) return D(Infinity);
		},
		
		getProduction(x, y) {
			let b = Building.getByPos(x, y);
			let enhancers = 0;
			for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, mapWidth - 1); i++) {
				for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, mapHeight - 1); j++) {
					if (map[i][j].t == 4) {
						enhancers++;
					}
				}
			}
			enhancers = Math.min(enhancers, 1);
			let base = BD[6].levelScaling(b.level);
			base = base.mul(b.meta.charge.max(0).add(1).pow(0.25));
			base = base.mul(RS.triplerII.effect);
			if (Research.has("rep4")) base = base.mul(1 + 3*enhancers);
			let mbase = base.mul(b.meta.charge.add(1).pow(0.15)).mul(tmp.anti.essenceEffect);
			let ebase = base.mul(b.meta.charge.add(1).pow(0.15)).mul(tmp.anti.moneyEffect);
			let ibase = base.mul(RS.doublerI.effect);
			mbase = mbase.mul(RS.quintuplerI.effect);
			ebase = ebase.mul(RS.quintuplerI.effect);
			if (player.iridite.researching)
				ibase = ibase.mul(Research.speed);
			let idepthMult = D(0);
			for (let i in DEPTHS.slice(0, b.meta.depth + 1)) {
				if (Depth.canAccess(b, i))
					idepthMult = idepthMult.add(DEPTHS[i].iridite);
			}
			return [mbase.mul(5e9), ebase.mul(1e7), ibase.mul(idepthMult)];
		},
		produceOres(b, d) {},
		timespeed(x, y) {
			let b = Building.getByPos(x, y);
			if (b.upgrading) return D(0);
			if (!b.meta.timespeed) b.meta.timespeed = D(0);
			return b.meta.timespeed.pow(RS.acv2.effect).add(1).pow(1/RS.acv2.effect).sub(1);
		}
	}
}