# 智能家居材料预埋指南 (Smart Home Pre-installation Guide)

## 1. Why Pre-installation Matters

Smart home retrofitting after renovation is expensive, messy, and often aesthetically compromised. Proper pre-installation during renovation ensures clean wire management, reliable connections, and future-proofing. This guide covers conduit planning, wiring, sensor positioning, and infrastructure requirements.

### Renovation Phase Checklist

| Phase | Smart Home Tasks |
|---|---|
| **Design** | Select ecosystem, map device locations, plan network topology |
| **Demolition** | Mark new outlet locations, identify hub placement |
| **Electrical rough-in** | Run neutral wires to all switch locations, install extra conduits |
| **Low-voltage rough-in** | Network cables, sensor wires, speaker wires, security |
| **Wall closing** | Photograph all wire runs, label both ends, test continuity |
| **Finishing** | Install smart switches, sensors, hubs, APs |
| **Commissioning** | Network setup, device pairing, automation programming |

---

## 2. Smart Home Ecosystem Selection

### Platform Comparison

| Ecosystem | Protocol | Local Control | Hub Required | Voice Assistant | Notes |
|---|---|---|---|---|---|
| **Apple HomeKit** | Thread, Wi-Fi, Bluetooth | Yes (with Thread Border Router) | Apple TV / HomePod / HomePod mini | Siri | Premium, privacy-focused, best iOS integration |
| **Xiaomi / Mi Home (米家)** | Zigbee 3.0, BLE Mesh, Wi-Fi | Partial (depends on device) | Xiaomi Gateway / Multimode | Xiao Ai | Widest device selection in China, cost-effective |
| **Aqara** | Zigbee 3.0, Thread, Wi-Fi | Yes (with Aqara Hub M2/M3) | Aqara Hub M2/M3 | Siri, Alexa, Google | Good HomeKit support, quality hardware |
| **Tuya / Smart Life** | Wi-Fi, Zigbee | Partial | Tuya Gateway | Alexa, Google | Massive device compatibility, budget |
| **Home Assistant** | Zigbee, Z-Wave, Thread, Wi-Fi, MQTT | Yes (fully local) | HA server (Raspberry Pi / NAS) | Any | Ultimate flexibility, DIY, technical skill needed |
| **Huawei HiLink (鸿蒙)** | Wi-Fi, BLE, PLC | Yes | Huawei router / hub | Celia | Growing ecosystem, PLC wired reliability |

### Protocol Comparison

| Protocol | Range | Bandwidth | Power Use | Mesh | Best For |
|---|---|---|---|---|---|
| **Zigbee 3.0** | 10–30m indoor | 250 kbps | Very low | Yes | Sensors, switches, locks |
| **Z-Wave** | 30–100m indoor | 100 kbps | Very low | Yes | Sensors, locks, thermostats |
| **Thread** | 10–30m indoor | 250 kbps | Very low | Yes | Next-gen standard, Matter compatible |
| **Wi-Fi** | 30–50m indoor | 100+ Mbps | High | No | Cameras, displays, speakers |
| **Bluetooth LE / BLE Mesh** | 10m | 1–2 Mbps | Low | Yes (mesh) | Proximity sensors, remotes |
| **Matter (over Thread/Wi-Fi)** | Depends on underlying | Varies | Varies | Yes | Universal standard (future-proof) |
| **RS-485 (wired)** | 1000m+ | High | N/A | No | Commercial, wired reliability |

> **Recommendation:** Plan for Zigbee 3.0 or Thread for sensors and switches, Wi-Fi for cameras and displays, and ensure your hub supports Matter for future compatibility.

---

## 3. Conduit Pre-Planning (管道预埋)

### General Rules
- **Every switch box needs a neutral wire** — this is the single most important pre-installation rule
- Run **at least one extra empty conduit** to each major location for future expansion
- Use **20mm conduits** (not 16mm) for switch locations to allow future cable additions
- Separate power and low-voltage conduits by **minimum 300mm**

### Conduit Layout by Room

#### Living Room

| Location | Conduits Needed | Wire Types | Notes |
|---|---|---|---|
| TV wall | 3 x 20mm conduits | Power + HDMI/ethernet + spare | HDMI conduit with pull string |
| Sofa wall | 2 x 20mm conduits | Power + ethernet | For floor lamp + smart speaker |
| Ceiling center | 2 x 20mm conduits | Power (ceiling light) + neutral | Smart switch needs neutral |
| Corner (curtain) | 1 x 20mm conduit | Power at ceiling height | For motorized curtain track |
| Window (sensor) | 1 x 16mm spare | Optional wired contact sensor | Usually wireless is sufficient |

#### Kitchen

| Location | Conduits Needed | Wire Types | Notes |
|---|---|---|---|
| Under-sink | 2 x 20mm | Power + spare | Water purifier, leak sensor, garbage disposal |
| Above cooktop | 1 x 20mm | Power | Smart range hood |
| Countertop level | 2 x 20mm | Power | Smart appliance outlets |
| Ceiling | 1 x 20mm | Power | Smart light / gas detector |
| Fridge area | 1 x 20mm | Power (dedicated circuit) | Smart fridge |

#### Bedroom

| Location | Conduits Needed | Wire Types | Notes |
|---|---|---|---|
| Each side of bed | 2 x 20mm | Power + USB | Bedside outlets + smart lamp |
| Door | 2 x 20mm | Power (switch) + neutral | Smart switch + scene panel |
| Window | 1 x 16mm | Power (optional) | Motorized curtain/blind |
| Ceiling | 2 x 20mm | Power + neutral | Smart light + optional projection screen power |

#### Bathroom

| Location | Conduits Needed | Wire Types | Notes |
|---|---|---|---|
| Mirror area | 2 x 20mm | Power | Smart mirror, LED lighting |
| Ceiling | 2 x 20mm | Power | Smart exhaust fan, heater, light |
| Toilet area | 1 x 20mm | Power | Smart toilet seat |
| Shower area | 1 x 16mm | Power (IP-rated) | Digital shower controller (optional) |
| Wall (sensor) | 1 x 16mm spare | Optional wired humidity sensor | Usually wireless |

### Switch Box Requirements

| Switch Type | Box Size | Wiring Needed |
|---|---|---|
| Standard single gang | 86 x 86mm | Live + Neutral + Load (each way) |
| Multi-gang (2–3 gang) | 86 x 86mm (deep) | Live + Neutral + multiple loads |
| Scene panel / touchscreen | 86 x 86mm (deep 50mm+) | Live + Neutral + ethernet (recommended) |
| Curtain switch | 86 x 86mm | Live + Neutral + 2 switched legs |
| Dimmer switch | 86 x 86mm (deep) | Live + Neutral + Load + earth |

> **Critical:** Request electricians to run **neutral wire (零线)** to EVERY switch location. Traditional Chinese wiring often omits neutral at switches (switch only breaks live). Smart switches need both live and neutral to power their electronics.

---

## 4. Wiring for Smart Switches

### Smart Switch Wiring Diagram (Text)

```
Distribution Box
    |
    |--- Live (火线) --------------------+--- to smart switch L terminal
    |                                     |
    |--- Neutral (零线) ------------------+--- to smart switch N terminal
    |
    +--- Earth (地线) --------------------+--- to smart switch E terminal (if metal)

Smart Switch
    |
    +--- L1, L2, L3 (load wires) -----> to each light fixture
```

### Wire Requirements

| Connection | Wire Size | Type | Notes |
|---|---|---|---|
| Live to switch | 2.5mm² | BV | Standard |
| Neutral to switch | 2.5mm² | BV | **Must be added** if not present |
| Load wires (to lights) | 1.5–2.5mm² | BV | Per lighting circuit |
| Earth | 2.5mm² | BVR | Required for metal switch plates |

### Smart Switch Types

| Type | Neutral Required | Installation | Best For |
|---|---|---|---|
| **Zero-fire version (零火版)** | Yes | L + N + Load | New construction, renovation (preferred) |
| **Single-fire version (单火版)** | No | L + Load only | Retrofit (existing homes), but less reliable |
| **No-neutral version (无零线)** | No | L + Load | Last resort; requires bypass capacitor |

> **Always choose zero-fire version (零火版) for new installations.** Single-fire switches have issues with low-wattage LED flickering and are less reliable.

---

## 5. Sensor Mounting Positions

### Sensor Placement Guide

| Sensor Type | Recommended Height | Location | Spacing | Notes |
|---|---|---|---|---|
| **Motion (PIR)** | 2.2–2.5m | Ceiling corner, facing entry | 5–8m coverage radius | Avoid pointing at AC vents, windows |
| **Motion (mmWave)** | 2.5–3.0m | Ceiling center of room | 6m coverage radius | Detects presence (breathing), not just motion |
| **Door/Window Contact** | Door frame height | Top corner of door/window | One per door/window | Magnet on door, sensor on frame |
| **Temperature/Humidity** | 1.5m | Interior wall, shaded | One per zone/room | Away from direct sun, AC vents, kitchens |
| **Light (Lux)** | 1.5m | Interior wall | One per room | Away from direct lamp light |
| **Water Leak** | Floor level | Under sinks, near water heater, washing machine | One per wet area | Place on lowest point |
| **Smoke Detector** | Ceiling center | Each room, hallway | Per fire code | Interconnected if wired |
| **Gas Detector** | Ceiling (natural gas) or floor (LPG) | Kitchen, near gas appliance | One per gas appliance area | Natural gas rises; LPG sinks |
| **Air Quality (VOC/PM2.5)** | 1.5m | Living room, bedroom | One per floor | Away from kitchen, open windows |
| **Noise** | 1.5m | Living room, nursery | One per room | For automation triggers |

### mmWave Sensor vs PIR

| Feature | PIR (Passive Infrared) | mmWave (Millimeter Wave Radar) |
|---|---|---|
| Detection | Body heat movement | Micro-movement (breathing, typing) |
| "Still person" detection | No (turns off if sitting still) | Yes (detects presence even when still) |
| Through materials | No (line of sight) | Yes (through thin walls, glass, fabric) |
| False triggers | Moderate (pets, sunlight) | Low |
| Cost | ¥20–80 | ¥80–300 |
| Power | Battery or wired | Wired (5V or 12V) |
| Recommended Use | Hallways, entry, closets | Living rooms, bedrooms, bathrooms |

### mmWave Sensor Installation Checklist
- [ ] Mount on ceiling for best coverage (360° models)
- [ ] Wall mount at 2.5m+ if ceiling not possible (directional models)
- [ ] Power: run 5V USB-C or 12V DC wire to sensor location
- [ ] Avoid placing near rotating fans, curtains, or moving objects that trigger false detection
- [ ] Configure detection zone in software to exclude false trigger areas
- [ ] Set appropriate "unoccupied delay" (30–60 seconds recommended)

---

## 6. Network Cable Requirements

### Cable Category Selection

| Cable Category | Max Speed | Max Distance | Suitable For | Recommendation |
|---|---|---|---|---|
| **Cat 5e** | 1 Gbps | 100m | Basic internet | **Minimum** — avoid for new installs |
| **Cat 6** | 1–10 Gbps | 55m (10G) / 100m (1G) | Gigabit + future | **Recommended** for most homes |
| **Cat 6a** | 10 Gbps | 100m | 10G backbone, PoE++ | **Ideal** for future-proofing |
| **Cat 7** | 10 Gbps | 100m | Shielded installations | Overkill for most; harder to terminate |
| **Cat 8** | 40 Gbps | 30m | Data centers | Unnecessary for residential |

> **Recommendation:** Install Cat 6a (六类a) to all fixed locations. The cost difference from Cat 6 is minimal during construction, and it supports 10 Gbps for future network upgrades.

### Network Drop Points

| Location | Number of Cat 6a Drops | Notes |
|---|---|---|
| **TV wall** | 3–4 | TV, set-top box, game console, spare |
| **Each bedroom** | 2 | Desktop PC, spare |
| **Study / office** | 4–6 | Desktop, NAS, printer, monitor, spare |
| **Kitchen** | 1 | Smart display / tablet |
| **Living room ceiling** | 1 | Wi-Fi AP (ceiling mount) |
| **Each floor hallway** | 1 | Wi-Fi AP |
| **Distribution box** | As needed | Smart home hub, network switch |
| **Door entrance** | 1 | Smart doorbell / camera |
| **Balcony** | 1 | Security camera |
| **Garage** | 1 | EV charger communication (optional) |

### PoE (Power over Ethernet) Devices

| Device | PoE Standard | Power | Notes |
|---|---|---|---|
| IP Camera | 802.3af (PoE) | 15.4W | Most common |
| Wi-Fi AP (ceiling) | 802.3af (PoE) | 15.4W | Ubiquiti, TP-Link Omada |
| Smart doorbell | 802.3af (PoE) | 15.4W | Wired alternative to battery |
| IP Phone | 802.3af (PoE) | 15.4W | Optional for home |
| PoE Switch | 802.3at (PoE+) | 30W | For downstream devices |
| Smart display | 802.3at (PoE+) | 30W | Wall-mounted control panel |

### Network Topology Recommendation

```
Internet (fiber optic modem / ONT)
    |
    |--- Main Router (with 2.5G WAN port)
            |
            +--- 2.5G/10G Switch (in distribution box)
                    |
                    +--- Cat 6a to each room drop
                    +--- Cat 6a to ceiling APs
                    +--- Cat 6a to PoE cameras
                    +--- Cat 6a to smart home hub
                    +--- Cat 6a to NAS
```

### Network Installation Checklist
- [ ] Run minimum Cat 6a, solid copper (not CCA — Copper-Clad Aluminum)
- [ ] Use shielded cable (STP) only if running near power lines; otherwise UTP is fine
- [ ] Label both ends of every cable
- [ ] Test every cable with certification tester (Fluke or equivalent)
- [ ] Leave 1m service loop at both ends
- [ ] Use structured media enclosure / patch panel in distribution box
- [ ] Conduit size: minimum 20mm for network cable runs (allow for future re-pull)
- [ ] Do NOT run network and power in the same conduit

---

## 7. Central Hub Placement

### Hub Placement Criteria

| Factor | Requirement | Why |
|---|---|---|
| **Centrality** | Central location in home | Maximizes Zigbee/Thread range to all devices |
| **Elevation** | 1.5–2.0m height | Avoids floor-level obstruction |
| **Power** | Always-on outlet (not switched) | Hub must run 24/7 |
| **Network** | Ethernet connection (not Wi-Fi) | Reliable, low-latency backbone |
| **Ventilation** | Open area, not enclosed in metal box | Zigbee/Thread signals attenuate in metal enclosures |
| **Accessibility** | Accessible for maintenance | USB ports, reset buttons, SD cards |

### Recommended Hub Locations

| Home Type | Best Hub Location | Notes |
|---|---|---|
| Small apartment (1–2 BR) | Living room shelf or TV cabinet | Central, easy access |
| Large apartment (3+ BR) | Central hallway ceiling or utility room | Maximize radio range |
| Multi-story villa | Each floor has a hub, wired together | Zigbee doesn't cross floors well |
| With NAS | Next to NAS / in equipment rack | Consolidate infrastructure |
| With HomeKit | Near Apple TV / HomePod | Thread Border Router co-location |

### Equipment Rack / Distribution Box Setup

| Component | Size / Space | Notes |
|---|---|---|
| Router | 1U or desktop | 2.5G WAN minimum |
| Switch | 8–16 port PoE+ | Managed switch with VLAN support |
| Smart Home Hub | Desktop (15 x 15 x 5cm) | Aqara M3, Home Assistant, etc. |
| NVR (camera recorder) | 4–8 bay | If using wired cameras |
| NAS | 2–4 bay | Media, backups, Home Assistant |
| Patch panel | 12–24 port | Organize all network drops |
| UPS | 600–1500VA | Keep network running during outages |
| **Enclosure** | 400 x 300 x 120mm minimum | Ventilated metal or plastic cabinet |

### Equipment Rack Checklist
- [ ] Dedicated 16A circuit for network equipment
- [ ] UPS backup for router, switch, and hub
- [ ] Ventilation: minimum 2 fans or passive vents
- [ ] Cable management: velcro ties (not zip ties) for serviceability
- [ ] Label every cable at both ends
- [ ] Leave 30% spare ports on switch for future devices
- [ ] Configure VLANs: separate IoT devices from main network
- [ ] Document IP addresses and device assignments

---

## 8. Special Considerations

### Smart Curtain Pre-installation

| Curtain Type | Power Location | Conduit | Notes |
|---|---|---|---|
| Motorized track | Ceiling, end of curtain rod | 20mm conduit to one end | Measure track length + 15cm for motor |
| Roller blind | Ceiling or wall, top of window | 16mm conduit | Battery options available |
| Venetian blind | Wall, beside window | 16mm conduit | Smart tilt/raise control |
| Roman shade | Ceiling | 16mm conduit | Requires compatible motor |

### Smart Lock Pre-installation

| Door Type | Requirement | Notes |
|---|---|---|
| Wooden door | Standard mortise size (6068 or 7255) | Measure before purchasing lock |
| Metal security door | Confirm lock body compatibility | May need adapter plate |
| Double door | Confirm latch direction | Smart locks are handed |
| Glass door | Special glass door lock | Different mechanism |

> **Tip:** No wiring needed for smart locks (battery powered), but consider pre-running a low-voltage wire for future hardwired models.

### Smart Mirror / Bathroom TV

| Item | Power Location | Water Protection |
|---|---|---|
| Smart mirror | Above mirror, concealed | IP44 minimum |
| Bathroom TV | Above vanity or in niche | IP65 for shower-adjacent areas |
| Heated towel rack | Wall, beside shower | Dedicated 16A circuit |

### Projector Pre-installation

| Item | Requirement | Notes |
|---|---|---|
| Ceiling mount | Reinforced ceiling box or concrete anchor | Verify projector weight capacity |
| HDMI conduit | 25mm conduit from TV rack to projector | HDMI 2.1 requires high-quality cable |
| Power | 1 x 10A outlet at projector location | |
| Screen power | 1 x 10A outlet at screen location | For motorized screen |
| Speaker wire | 2 x 16mm² to rear speaker locations | If planning surround sound |

---

## 9. Complete Pre-installation Checklist

### Electrical
- [ ] Neutral wire at EVERY switch location
- [ ] 20mm conduits at all switch boxes (not 16mm)
- [ ] Extra empty conduit to major locations
- [ ] Dedicated circuit for smart water heater
- [ ] Outlet under every sink (water purifier, leak sensor)
- [ ] Outlet at ceiling for motorized curtains
- [ ] Outlet at door entrance for smart doorbell/camera

### Low-Voltage
- [ ] Cat 6a to every room (minimum 2 drops per room)
- [ ] Cat 6a to TV wall (3–4 drops)
- [ ] Cat 6a to ceiling AP locations
- [ ] Cat 6a to smart home hub location
- [ ] Cat 6a for doorbell camera
- [ ] Cat 6a for each PoE camera location
- [ ] Spare conduits with pull string everywhere

### Structural
- [ ] Reinforced ceiling mount for projector
- [ ] Reinforced wall for wall-mounted smart display
- [ ] Niche in shower for smart controls
- [ ] Equipment rack / cabinet space in distribution area
- [ ] Ventilation plan for equipment rack

### Final Verification (Before Wall Closing)
- [ ] Photograph every wall with conduits visible
- [ ] Label both ends of every wire and conduit
- [ ] Test continuity of all network cables
- [ ] Test power to all outlet locations
- [ ] Verify neutral present at all switch boxes
- [ ] Document smart device plan with exact locations
- [ ] Share documentation with future self / next electrician

---

## 10. Cost Estimates

### Pre-installation Cost Breakdown

| Item | Unit Cost | Typical Quantity | Total |
|---|---|---|---|
| Extra neutral wire to switches | ¥5–10/m | 50–100m | ¥250–1000 |
| Extra empty conduit (20mm) | ¥3–5/m | 30–50m | ¥90–250 |
| Cat 6a cable | ¥2–4/m | 200–400m | ¥400–1600 |
| Network outlet (faceplate + module) | ¥15–30/point | 10–20 points | ¥150–600 |
| Smart switch (zero-fire, per gang) | ¥50–150 | 10–20 switches | ¥500–3000 |
| Smart home hub | ¥200–800 | 1–2 | ¥200–1600 |
| Wi-Fi AP (ceiling, PoE) | ¥200–600 | 2–4 | ¥400–2400 |
| PoE switch (8-port) | ¥300–800 | 1 | ¥300–800 |
| **Estimated total (pre-installation materials)** | | | **¥2290–11250** |

> **Note:** These are material costs only. Labor for extra wiring during renovation typically adds 20–40%. The cost of retrofitting after renovation (chasing walls, surface-mount trunking) can be 3–5x higher.

---

## 11. Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---|---|---|
| No neutral at switches | Cannot install reliable smart switches | Specify "零线到每个开关" to electrician |
| 16mm conduit at switches | Cannot pull additional wires later | Use 20mm minimum |
| No spare conduit | No room for future upgrades | Always run 1 extra empty conduit |
| Cat 5e instead of Cat 6a | Limited to 1 Gbps, no 10G future | Specify Cat 6a minimum |
| Hub in metal cabinet | Zigbee/Thread signal blocked | Use plastic/vented enclosure |
| No network to ceiling | Cannot install ceiling AP | Plan AP locations early |
| No outlet under sink | Cannot power leak sensor/purifier | Add under-sink outlets |
| No curtain motor power | Cannot add motorized curtains later | Run power to curtain track end |
| Wi-Fi hub instead of Ethernet hub | Unreliable smart home network | Hub on wired Ethernet |
| No equipment rack documentation | Future electricians can't trace wires | Label and photograph everything |
