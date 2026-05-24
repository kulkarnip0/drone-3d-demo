# Next Steps

This project should evolve from a visual 3D demo into a lightweight drone mission sandbox.

## Version 1: Visual mission world

Status: Done

- Terrain
- Roads
- Buildings
- Trees
- Mission zones
- Three moving drones
- Visible drone paths

## Version 2: Mission assignment

Goal: Make the demo show basic swarm intent.

Planned features:

- Add visible labels above each drone
- Add labels for mission zones
- Assign each drone to one mission zone
- Show mission role text such as Search, Monitor, and High-Risk Watch

## Version 3: Coverage and belief map

Goal: Show why multiple drones need coordination.

Planned features:

- Add grid overlay on ground
- Mark cells as unknown, covered, high-risk, or possible target
- Update covered cells as drones move
- Show a simple shared global belief map

## Version 4: Simple coordination logic

Goal: Move from fixed paths to simple autonomy.

Planned features:

- Reduce overlap between drone coverage areas
- Reassign drone if high-risk zone appears
- Add simple return-to-base behavior
- Add basic no-fly-zone avoidance

## Version 5: Investor dashboard overlay

Goal: Make it presentation friendly.

Planned features:

- Mission timer
- Number of drones active
- Area covered percentage
- Detected targets count
- Risk level indicator

## Version 6: Real drone integration placeholder

Goal: Prepare for future hardware connection.

Planned features:

- Add MAVLink placeholder module
- Add telemetry interface design
- Add simulated GPS/altitude/heading data
- Later connect to real or simulated drone telemetry
