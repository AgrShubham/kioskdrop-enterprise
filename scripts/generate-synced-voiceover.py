#!/usr/bin/env python3
"""
KioskDrop Enterprise - Master Indian Female Voiceover & Timeline Generator
Uses Microsoft Azure Neural TTS ('en-IN-NeerjaNeural') to generate professional,
executive Indian English voiceover narration and exports precise clip timing data.
"""

import os
import sys
import json
import asyncio
import subprocess
import edge_tts
import imageio_ffmpeg

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
VOICE = "en-IN-NeerjaNeural"  # Professional, articulate Indian female voice
RECORDINGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "recordings")
TEMP_DIR = os.path.join(RECORDINGS_DIR, "temp_voiceover_neerja")

os.makedirs(TEMP_DIR, exist_ok=True)

# Scene-by-scene script tailored for professional Indian enterprise presentation
SCENES = [
    {
        "id": "scene1_intro",
        "action": "home_hero",
        "text": "Welcome to KioskDrop Enterprise, the automated conference room AV micro-logistics platform designed to eliminate last-meter meeting room equipment failures.",
        "post_pause_sec": 1.2
    },
    {
        "id": "scene1_problem",
        "action": "home_scroll_navbar",
        "text": "In corporate offices, when a display cable fails or an adapter goes missing, executive meetings stall, costing enterprises an average of fifty-four thousand dollars per room annually in lost productivity.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene1_theme",
        "action": "toggle_theme",
        "text": "Notice our global command bar with real-time Server-Sent Events telemetry. With a single click, our theme engine triggers a smooth circular ripple, switching between our crisp light day theme and our Obsidian dark mode.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene1_persona",
        "action": "show_persona",
        "text": "The platform includes enterprise Role-Based Access Control, seamlessly adapting whether you are a meeting room employee, an IT infrastructure administrator, or a FinOps auditor.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene2_request_nav",
        "action": "nav_request",
        "text": "Let us explore the employee workflow. When an AV failure occurs, the employee simply scans the QR code outside their conference room to initiate instant diagnosis.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene2_symptom",
        "action": "select_symptom_and_port",
        "text": "The system ingests the room context. If the employee reports a mechanically damaged or loose laptop port, our triage engine automatically pivots from a standard cable to an Enterprise 4K Wireless HDMI transmitter kit.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene2_pin",
        "action": "generate_pin",
        "text": "Clicking Reserve allocates the nearest floor locker, generates an authenticated six-digit one-time access PIN, sets a ten-minute countdown timer, and automatically creates a ServiceNow incident ticket.",
        "post_pause_sec": 2.0
    },
    {
        "id": "scene3_kiosk_nav",
        "action": "nav_kiosk",
        "text": "Now walking up to the physical twelve-bay smart locker terminal. Each locker continuously streams live hardware telemetry, including ambient temperature and solenoid lock status.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene3_keypad",
        "action": "enter_pin_keypad",
        "text": "The employee inputs their six-digit reservation PIN on the tactile numeric keypad and presses Enter. The solenoid lock actuates instantly, popping the compartment door open.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene3_sensor_rfid",
        "action": "take_device_and_rfid",
        "text": "Infrared break-beam sensors detect device removal in real time, and recurring employees can also authenticate with corporate RFID badge taps.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene3_badusb",
        "action": "badusb_defense",
        "text": "If an unwhitelisted rogue USB device is plugged in, our zero-trust endpoint defense detects the unauthorized Vendor ID, sounds a security alarm, and locks the bay into maintenance quarantine.",
        "post_pause_sec": 2.0
    },
    {
        "id": "scene4_admin_nav",
        "action": "nav_admin_elevate",
        "text": "Stepping into the Enterprise Command Center, we escalate to Priya Patel, our IT Infrastructure Administrator, unlocking full administrative oversight.",
        "post_pause_sec": 1.5
    },
    {
        "id": "scene4_customs",
        "action": "customs_calculator",
        "text": "Tab one features our statutory Indian Customs Landed-Cost engine, computing Basic Customs Duty, Social Welfare Surcharge, and Integrated GST, while the asset registry manages cryptographic USB hardware whitelisting.",
        "post_pause_sec": 2.0
    },
    {
        "id": "scene4_finops",
        "action": "finops_tab",
        "text": "Tab two tracks wholesale procurement savings versus emergency courier purchases, with Happay corporate card category locks and automated ERP posting into SAP and Zoho Books.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene4_analytics",
        "action": "analytics_recharts",
        "text": "Tab three detects meeting room consumption anomalies and visualizes procurement economics with interactive financial comparison charts.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene4_webhooks",
        "action": "webhooks_tab",
        "text": "Tab four provides complete audit observability with real-time bi-directional ServiceNow and Zendesk webhook event delivery and zero-downtime payload replay.",
        "post_pause_sec": 1.8
    },
    {
        "id": "scene5_conclusion",
        "action": "return_home_wrapup",
        "text": "KioskDrop Enterprise transforms conference room AV reliability from an IT vulnerability into a dependable sixty-second micro-logistics pipeline. Thank you for watching.",
        "post_pause_sec": 2.5
    }
]

def get_audio_duration(file_path):
    cmd = [
        FFMPEG_PATH,
        "-i", file_path,
        "-hide_banner"
    ]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True, errors="replace")
    for line in result.stderr.splitlines():
        if "Duration:" in line:
            time_str = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = time_str.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 0.0

async def generate_all_speech():
    print(f"🎙️ Generating {len(SCENES)} speech clips using voice: {VOICE}...")
    current_time = 0.5
    timeline_data = []

    for scene in SCENES:
        output_file = os.path.join(TEMP_DIR, f"{scene['id']}.mp3")
        scene["file"] = output_file
        print(f"  Synthesizing: {scene['id']}...")
        communicate = edge_tts.Communicate(scene["text"], VOICE, rate="+2%")
        await communicate.save(output_file)

        duration = get_audio_duration(output_file)
        scene["duration_sec"] = duration
        scene["start_time_sec"] = current_time
        scene["end_time_sec"] = current_time + duration

        timeline_data.append({
            "id": scene["id"],
            "action": scene["action"],
            "start_time_sec": round(current_time, 2),
            "duration_sec": round(duration, 2),
            "post_pause_sec": scene["post_pause_sec"],
            "total_scene_sec": round(duration + scene["post_pause_sec"], 2),
            "file": output_file,
            "text": scene["text"]
        })

        current_time += duration + scene["post_pause_sec"]

    print(f"\n📊 Total Timeline Duration: {round(current_time, 2)} seconds (~{round(current_time/60, 1)} minutes)")

    # Save timeline JSON for the Playwright browser recorder
    timeline_path = os.path.join(RECORDINGS_DIR, "voiceover_timeline.json")
    with open(timeline_path, "w", encoding="utf-8") as f:
        json.dump({
            "voice": VOICE,
            "total_duration_sec": round(current_time, 2),
            "scenes": timeline_data
        }, f, indent=2)
    print(f"✅ Saved timing plan to: {timeline_path}")

    # Build concatenated master audio track
    final_audio = os.path.join(RECORDINGS_DIR, "kioskdrop_indian_female_voiceover.mp3")
    inputs = []
    filter_parts = []
    
    for i, item in enumerate(timeline_data):
        inputs.extend(["-i", item["file"]])
        delay_ms = int(item["start_time_sec"] * 1000)
        filter_parts.append(f"[{i}:a]adelay=delays={delay_ms}:all=1[a{i}]")

    mix_inputs = "".join(f"[a{i}]" for i in range(len(timeline_data)))
    filter_complex = f"{';'.join(filter_parts)};{mix_inputs}amix=inputs={len(timeline_data)}:normalize=0[aout]"

    cmd = [
        FFMPEG_PATH,
        "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-c:a", "libmp3lame",
        "-q:a", "2",
        final_audio
    ]
    subprocess.run(cmd, check=True)
    print(f"✅ Master Indian Female Audio Track generated: {final_audio}")
    return final_audio

if __name__ == "__main__":
    asyncio.run(generate_all_speech())

