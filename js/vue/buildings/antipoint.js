ANTIPOINT.menuData = {
	id: "antipoint",
	name: "Antipoint",
	style: {
		width: '750px',
		height: '500px'
	},
	load() {
		Vue.component("antipoint-menu", {
			data() { return {
				player,
				Building,
				tab: "a",
				tmp,
				BD
			}},
			methods: {
				format
			},
			computed: {
				building() {
					return Building.getByPos(this.data.x, this.data.y);
				}
			},
			props: ["data"],
			template: `<div style="padding: 10px">
				<div v-if="data.quick || !building.upgrading">
					<div class="centre">
						<button @click="tab = 'a'" :disabled="tab == 'a'" class="subtab-button">Global Drain</button>
						<button @click="tab = 'b'" :disabled="tab == 'b'" class="subtab-button">Global Effects</button>
					</div>

					<h2 v-if="!data.quick && BD[5].getEffect(data.x, data.y).lt(1)">This antipoint is enduring competition with nearby antipoints, lowering its effectiveness</h2>

					<antipoint-drain-display v-if="tab == 'a'" />

					<antipoint-resource-display v-else-if="tab == 'b'" />
					<br><br>

					<button v-if="!data.quick" @click="Building.sell(data.x, data.y)">Sell</button>
				</div>
				<upgrade-progress :x="data.x" :y="data.y" v-else></upgrade-progress>
			</div>`
		})

		Vue.component("antipoint-drain-display", {
			data() { return {
				player
			}},
			template: `<div class="col centre" style="padding: 10px;">
				<button :disabled="player.anti.drain == 'none'" class="upg-button" style="min-height: 120px;" @click="player.anti.drain = 'none'">
					<span v-if="player.anti.drain != 'none'">
						<b class="anti">{{player.anti.drain[0].toUpperCase() + player.anti.drain.slice(1)}} drain</b><br><br>
						<i class="sub">Disable</i>
					</span>
					<span v-else>
						You aren't draining anything.
					</span>
				</button>
				<br>
				<div>
					<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'money'">
						<b>Drain <b class="anti">Money</b></b><br><br>
						Removes 0.3% <span class="money">$</span> every second and converts it to <span class="anti">^$</span>
					</button>
					<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'essence'">
						<b>Drain <b class="anti">Essence</b></b><br><br>
						Removes 0.3% <span class="essence">*</span> every second and converts it to <span class="anti">^*</span>
					</button>
					<button class="upg-button" style="min-height: 130px;" @click="player.anti.drain = 'time'">
						<b>Drain <b class="anti">Time</b></b><br><br>
						Reverses and amplifies flow of time, converting it to <span class="anti">^Δ</span>
					</button>
				</div>
			</div>`
		})

		Vue.component("antipoint-resource-display", {
			data() { return {
				player,
				tmp
			}},
			methods: {
				format
			},
			template: `<div style="padding: 10px;">
				<span style="font-size: 20px;">
					<span class="anti">^$</span> {{format(player.anti.money)}} | 
					<span class="anti">^*</span> {{format(player.anti.essence)}} | 
					<span class="anti">^Δ</span> {{format(player.anti.time)}}
				</span>
				<br><br>
				<span class="anti" style="font-size: 20px;">^$</span>:
				<span class="essence">*</span> gain x{{format(tmp.anti.moneyEffect)}}<br>

				<span class="anti" style="font-size: 20px;">^*</span>:
				<span class="money">$</span> gain x{{format(tmp.anti.essenceEffect)}}<br>

				<span class="anti" style="font-size: 20px;">^Δ</span>:
				Time rate x{{format(tmp.anti.timeEffect)}}<br><br>

				Antipoint effectiveness: {{format(tmp.anti.antisum)}} (increases with antipoints built)
			</div>`
		})
	}
}