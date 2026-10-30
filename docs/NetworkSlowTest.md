# TopLight Network Speed & Resilience Testing Cheat Sheet

This document lists all available speed presets, latency values, and offline commands supported by ADB.

---

## ⚡ 1. All Supported Network Speed Presets (`adb emu network speed <preset>`)

You can choose any of these speeds depending on what you want to simulate:

| Speed Preset | Network Generation | Upload / Download Speed | Real-World Scenario |
|---|---|---|---|
| `gsm` | 2G (GSM) | 9.6 kbps / 9.6 kbps | Extreme edge of coverage, nearly disconnected |
| `gprs` | 2G (GPRS) | 28.8 kbps / 80.0 kbps | Low signal, underground parking, rural site |
| `edge` | 2.5G (EDGE) | 48.0 kbps / 236.8 kbps | **(Recommended)** Common slow mobile network in India |
| `umts` | 3G (Basic) | 128.0 kbps / 384.0 kbps | Standard 3G, moderate loading delay |
| `hsdpa` | 3.5G (H+) | 348.0 kbps / 14.4 Mbps | Good 3G, fast JSON API response |
| `lte` | 4G (LTE) | 50.0 Mbps / 100.0 Mbps | Fast 4G mobile data |
| `full` | WiFi / Unlimited | Unlimited | Default normal high-speed WiFi |

### Custom Upload & Download Speeds:
You can also set exact custom speeds in `kbps`:
```bash
# Example: 50 kbps upload, 100 kbps download
adb emu network speed 50 100
```

---

## ⏱️ 2. All Supported Latency Presets (`adb emu network delay <preset>`)

Latency controls the "ping delay" before the server receives requests:

| Delay Preset | Latency (Min / Max) | Effect on TopLight App |
|---|---|---|
| `gprs` | 150ms / 550ms | Very noticeable lag, spinners spin for ~2–4s |
| `edge` | 80ms / 400ms | **(Recommended)** Realistic mobile cell tower latency |
| `umts` | 35ms / 200ms | Mild latency |
| `none` | 0ms | Normal local latency (default) |

---

## 🎯 3. Recommended Testing Profiles

### Profile A: Slow 2G/EDGE (Recommended Real-World Field Test)
Simulates an employee marking OnDuty or Attendance with 1 bar of mobile signal:
```bash
adb emu network speed edge
adb emu network delay edge
```

### Profile B: Very Slow 2G (Stress & Timeout Test)
Simulates near-dead mobile connection to test AbortController and timeout errors:
```bash
adb emu network speed gprs
adb emu network delay gprs
```

### Profile C: Complete Offline Mode (Connection Error Card)
Tests the red `wifi-off` icon and "Retry Connection" button:
```bash
# Turn off both cellular and wifi
adb shell svc data disable
adb shell svc wifi disable
```

### Profile D: Broken DNS Server (Cloudflare DoH Fallback Test)
Simulates DNS failure where the local ISP's DNS is dead:
```bash
# Route DNS to a dead IP
adb shell setprop net.dns1 10.255.255.1
```

---

## 🔄 4. How to Restore Everything Back to Normal

When you are done testing, reset your device back to full speed:
```bash
adb emu network speed full
adb emu network delay none
adb shell svc data enable
adb shell svc wifi enable
adb shell setprop net.dns1 8.8.8.8
```

---

## 📱 5. Testing on a REAL Physical Android Phone (Connected via USB)

> **Note:** `adb emu` commands only work on the **Android Emulator**. If you are using a **real physical phone**, do this instead:

1. **Option 1: Switch to 2G in Phone Settings**
   * Go to **Phone Settings** → **Mobile Network** → **SIM 1** → **Preferred network type** → select **"2G only"**.
2. **Option 2: Use ADB to turn off data/wifi on the real phone:**
   ```bash
   # Turn off Internet on real phone
   adb shell svc data disable
   adb shell svc wifi disable

   # Turn Internet back on
   adb shell svc data enable
   adb shell svc wifi enable
   ```
