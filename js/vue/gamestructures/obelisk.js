const OBELISK = {
	menuData: {
		id: "obelisk",
		name: "Obelisk",
		style: {
			width: '750px',
			height: '600px'
		},
		load() {
			Vue.component("obelisk-menu", {
				data() { return {
					player,
					tmp,
					Obelisk,
					tab: "a"
				}},
				methods: {
					reactivate() {
						if (Currency.essence.amt.lt(50)) return;
						Currency.essence.use(50);
						player.obelisk.repairing = true;
					},
					timerate,
					format,
					formatTime,
					D
				},
				template: `<div style="padding: 10px">
					Time rate: x {{format(timerate())}}<br><br>

					<button @click="reactivate" :disabled="player.currency.essence.lt(50)" class="upg-button" v-if="!player.obelisk.repairing && !player.obelisk.repaired">
						<b>Reactivate the Obelisk.</b><br><br>
						Cost: <essence-display :amt="50" whole="a"></essence-display>
					</button>

					<div v-if="player.obelisk.repairing">
						You feel like something's not quite right...<br>
						<bar :time="player.obelisk.time" :max="D(6)"></bar>
					</div>

					<div v-if="player.obelisk.repaired" class="centre col">
						Obelisk effect: x{{format(tmp.obelisk.effect)}} time rate
						({{player.obelisk.activeTime.gt(0) ? "" : "IN"}}ACTIVE)<br><br>

						<span v-if="player.obelisk.activeTime.gt(0)">
							Time active: <bar :time="player.obelisk.activeTime" :max="tmp.obelisk.activeTime"></bar>
						</span>
						<span v-else>
							Cooldown: <bar :time="player.obelisk.cooldownTime" :max="tmp.obelisk.cooldownTime"></bar>
						</span>
						<br>

						<div v-if="player.auto.obelisk.unl">
							<button @click="player.auto.obelisk.on = !player.auto.obelisk.on; if (player.auto.obelisk.on) Obelisk.activate();">
								Auto-activate:<br>{{player.auto.obelisk.on ? "ON" : "OFF"}}
							</button><br>
						</div>
						<button @click="Obelisk.activate" :disabled="player.currency.essence.lt(40) || player.obelisk.activeTime.gt(0) || player.obelisk.cooldownTime.lt(tmp.obelisk.cooldownTime)" class="upg-button">
							<b>{{player.obelisk.activeTime.gt(0) ? "(ACTIVE)" : "Activate the Obelisk."}}</b>
							<span v-if="player.obelisk.activeTime.lte(0)"><br><br>Cost: <essence-display :amt="40" whole="a"></essence-display></span>
						</button>


						<div class="centre" style="width: 100%">
							<button @click="tab = 'a'" :disabled="tab == 'a'" class="subtab-button">Upgrades</button>
							<button @click="tab = 'b'" :disabled="tab == 'b'" class="subtab-button">Offline time</button>
						</div>

						<div v-if="tab == 'a'">
							<button @click="Obelisk.buyTimepercentUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.timepercentUpgCost())"
							:class="{bought: player.obelisk.upgs.timepercent >= 30}">
								<b>Increase the active time of the obelisk.</b><br>
								Cooldown: {{formatTime(tmp.obelisk.cooldownTime)}}<br>
								Active: {{formatTime(tmp.obelisk.activeTime)}}<br><br>
								Cost: <essence-display :amt="Obelisk.timepercentUpgCost()" whole="a"></essence-display>
							</button>
							<button @click="Obelisk.buyPowerUpg" class="upg-button" :disabled="player.currency.essence.lt(Obelisk.powerUpgCost())"
							:class="{bought: player.obelisk.upgs.power >= 30}">
								<b>Increase obelisk power by 30%.</b><br>
								Currently: {{format(tmp.obelisk.effect)}}<br><br>
								Cost: <essence-display :amt="Obelisk.powerUpgCost()" whole="a"></essence-display>
							</button>
						</div>

						<div v-if="tab == 'b'" class="centre col">
							Offline time: {{formatTime(player.time.offline)}}<br>
							<button :disabled="player.time.offline <= 0" :class="{ 'anti-button': player.time.drainOffline }"
							@click="player.time.drainOffline = !player.time.drainOffline">
								Discharge offline time at 40% efficiency<br>
								to gain a x{{format(player.time.velocity)}} time boost
							</button>
						</div>
					</div>
				</div>`
			})
		}
	}
}