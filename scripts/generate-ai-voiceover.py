#!/usr/bin/env python3
"""
KioskDrop Enterprise - AI Voiceover Generator & Video Muxer
Synthesizes professional neural voiceover narration and synchronizes it with the recorded demo video.
"""

import os
import sys
import subprocess
import asyncio
import edge_tts
import imageio_ffmpeg

# Ensure utf-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
VOICE = "en-US-ChristopherNeural"  # Professional, confident executive voice
RECORDINGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "recordings")
TEMP_DIR = os.path.join(RECORDINGS_DIR, "temp_voiceover")

os.makedirs(TEMP_DIR, exist_ok=True)

# Timed script segments synchronized with kioskdrop_enterprise_demo.webm (Total ~106s)
SEGMENTS = [
    {
        "id": "scene1_intro",
        "target_start_sec": 0.5,
        "text": "Welcome to KioskDrop Enterprise, the automated conference room AV micro-logistics platform that eliminates last-meter meeting room equipment failures."
    },
    {
        "id": "scene1_navbar",
        "target_start_sec": 9.5,
        "text": "Notice the global navbar with live Server-Sent Events telemetry. With a single click, our theme engine triggers a smooth circular ripple, switching between a high-contrast day mode and our Obsidian dark mode."
    },
    {
        "id": "scene2_request",
        "target_start_sec": 23.5,
        "text": "Now stepping into the Employee Rapid-Drop portal. When an AV cable fails, the employee selects their room and diagnoses the issue, such as a BYOD display failure."
    },
    {
        "id": "scene2_pin",
        "target_start_sec": 35.0,
        "text": "If the employee flags a mechanically damaged port, the engine automatically pivots to an Enterprise 4K Wireless HDMI transmitter and generates an instant 6-digit access PIN with a 10-minute countdown."
    },
    {
        "id": "scene3_keypad",
        "target_start_sec": 47.0,
        "text": "At the physical floor locker terminal, the employee enters their one-time access PIN on the tactile numeric keypad and presses Enter. The solenoid lock actuates instantly, popping the compartment door open."
    },
    {
        "id": "scene3_rfid",
        "target_start_sec": 59.0,
        "text": "Infrared break-beam sensors detect device removal in real time, and recurring employees can also authenticate instantly with corporate RFID badge taps."
    },
    {
        "id": "scene4_customs",
        "target_start_sec": 68.5,
        "text": "Elevating to the Command Center, our Indian Customs Statutory Landed-Cost calculator computes assessable values, Basic Customs Duty, and Integrated GST, while the zero-trust registry whitelists authorized USB hardware."
    },
    {
        "id": "scene4_finops",
        "target_start_sec": 82.5,
        "text": "Our FinOps dashboard tracks wholesale B2B savings versus emergency courier purchases with ERP auto-posting, while 360-degree analytics flags consumption anomalies and visualizes procurement economics."
    },
    {
        "id": "scene5_conclusion",
        "target_start_sec": 97.0,
        "text": "With bi-directional ServiceNow and Zendesk webhooks, KioskDrop transforms meeting room reliability from an IT vulnerability into a seamless enterprise advantage."
    }
]

async def generate_speech_clips():
    print(f"🎙️ Synthesizing {len(SEGMENTS)} voiceover segments with voice: {VOICE}...")
    for seg in SEGMENTS:
        output_file = os.path.join(TEMP_DIR, f"{seg['id']}.mp3")
        seg["file"] = output_file
        print(f"  Generating clip: {seg['id']} at ~{seg['target_start_sec']}s...")
        communicate = edge_tts.Communicate(seg["text"], VOICE, rate="+3%")
        await communicate.save(output_file)

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

def build_synchronized_voiceover_track():
    print("\n🎧 Assembling full synchronized audio track with ffmpeg...")
    final_audio = os.path.join(RECORDINGS_DIR, "kioskdrop_voiceover_track.mp3")

    # Build complex filter with adelay for each clip
    inputs = []
    filter_parts = []
    
    for i, seg in enumerate(SEGMENTS):
        inputs.extend(["-i", seg["file"]])
        delay_ms = int(seg["target_start_sec"] * 1000)
        filter_parts.append(f"[{i}:a]adelay=delays={delay_ms}:all=1[a{i}]")

    mix_inputs = "".join(f"[a{i}]" for i in range(len(SEGMENTS)))
    filter_complex = f"{';'.join(filter_parts)};{mix_inputs}amix=inputs={len(SEGMENTS)}:normalize=0[aout]"

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
    print(f"✅ Full voiceover track generated: {final_audio}")
    return final_audio

def mux_video_with_voiceover(audio_path):
    input_video = os.path.join(RECORDINGS_DIR, "kioskdrop_enterprise_demo.webm")
    output_mp4 = os.path.join(RECORDINGS_DIR, "kioskdrop_enterprise_demo_with_voiceover.mp4")
    output_webm = os.path.join(RECORDINGS_DIR, "kioskdrop_enterprise_demo_with_voiceover.webm")

    if not os.path.exists(input_video):
        print(f"❌ Input video not found at: {input_video}")
        return

    print(f"\n🎬 Muxing video with AI voiceover into MP4 & WebM...")
    
    # 1. Output MP4 (H.264 + AAC) - Highest compatibility
    cmd_mp4 = [
        FFMPEG_PATH,
        "-y",
        "-i", input_video,
        "-i", audio_path,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_mp4
    ]
    subprocess.run(cmd_mp4, check=True)
    print(f"🎉 Created Voiced-over MP4: {output_mp4}")

    # 2. Output WebM (VP9 + Opus)
    cmd_webm = [
        FFMPEG_PATH,
        "-y",
        "-i", input_video,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "libopus",
        "-b:a", "128k",
        "-shortest",
        output_webm
    ]
    subprocess.run(cmd_webm, check=True)
    print(f"🎉 Created Voiced-over WebM: {output_webm}")

async def main():
    await generate_speech_clips()
    audio_track = build_synchronized_voiceover_track()
    mux_video_with_voiceover(audio_track)
    print("\n✨ AI Voiceover Generation and Video Integration Complete!")

if __name__ == "__main__":
    asyncio.run(main())
