# Controls update 5.2 — player-controlled collision risk

This supersedes the automatic-safety and green-hold mechanics of 5.1.

Four separate lights release cars regardless of cross traffic. Collision detection uses swept vehicle rectangles so contact during a physics step is detected. A crash freezes the cars, displays an impact cue, then opens results with replay. Closing a light stops new entrants but cannot stop cars already crossing.

Green does not expire. Each approach instead displays the shortest remaining patience among its waiting cars, in seconds, plus a draining bar. Empty approaches show STOP or GO, not a fake countdown. Tapping does not reset patience. Ambulance timeouts cost two strikes. Three strikes or a crash ends a run; campaign and Daily goals and time still apply.

27 automated tests and the browser suite passed. Tests include an intentional crash, safe crossing after clearance, unrestricted entry on green, independent timers for waiting cars, restart after a crash, all 12 authored levels and 200 generated levels under careful control. Layout checks include compact portrait, landscape and safe-area insets.

Production build and Capacitor sync completed. Android/iOS binaries have not been compiled, signed or tested on physical hardware. Existing store artwork is unchanged.
