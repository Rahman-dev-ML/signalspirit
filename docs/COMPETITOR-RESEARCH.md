# In-game competitor review — 19 October 2026

Scope: primary store listings, developer descriptions, published gameplay screenshots, and player reviews for three direct traffic-control competitors. These are observations and design hypotheses, not a claim to have installed each app or measured their retention. Download totals are store bands, not evidence that a specific feature caused success.

| Game | Observable in-game pattern | Relevant player feedback | Applied to Signal Sprint |
|---|---|---|---|
| Traffix, Infinity Games | Traffic lights use recognizable red/amber/green states; clean top-down road focus; different city challenges and vehicle types | Visible reviews report ambiguous closely spaced controls, too little warning of incoming traffic, and difficulty depending on offscreen prediction | A single large directional switch, clear current/next-road indicator, amber clearance explanation, lane arrows and approach visibility. No hidden red-light-breaking behavior. |
| Traffic Lanes 2, ShadowTree | Multiple modes, weather, day/night, emergency/roadwork variety; readable top-down traffic | Reviews praise changing events, detailed traffic, and goal/arcade/unlimited modes | Journey, daily and survival options; changing district palettes; buses, emergencies, crossings and rain introduced gradually. |
| Traffic Rush, Donut Games | Immediately understandable intersection action; rising intensity; extra train mode adds variety | Older reviews object to ads blocking approaching vehicles; newer reviews object to unexpected paywalls | Large controls outside the landscape board; no banner over traffic, no purchases or forced ads in this mobile release; no fixed final-level paywall. |

## Primary sources
- https://play.google.com/store/apps/details?id=com.infinity.traffix
- https://play.google.com/store/apps/details?id=se.shadowtreesoftware.trafficlanes2free
- https://play.google.com/store/apps/details?id=com.donutgames.trafficrush

## Decisions grounded in our implementation
The original switch button was disabled while the safe junction interlock ran. That made taps silent and made the delay appear broken. The updated UI acknowledges every in-game switch tap immediately. It displays the next road while clearing; a second tap explains the existing change rather than toggling twice. One tap during the short cooldown queues one change. The interlock still waits for the rear of committed vehicles to leave.

The first twelve levels introduce mechanics. Subsequent levels are generated on demand, with deterministic per-level seeds, rotating districts, growing arrival pressure and bounded patience/speed. It is a continuing sequence of timed levels, not merely a survival mode with a new label. Difficulty parameters increase asymptotically rather than escalating speed until the game becomes physically impossible. This does not prove that every possible generated level is equally enjoyable; the validation document records the tested sample.

No competitor characters, sound recordings, screenshots, code or graphical assets are shipped.
