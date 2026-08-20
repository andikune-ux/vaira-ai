import math
import os
import wave

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
RATE = 44100


def tone(path, notes, duration=0.12, volume=0.16, gap=0.0):
    samples = []
    for freq, length in notes:
        count = int(RATE * length)
        for i in range(count):
            t = i / RATE
            attack = min(1.0, i / max(1, int(RATE * 0.008)))
            release = min(1.0, (count - i) / max(1, int(RATE * 0.025)))
            env = attack * release
            value = math.sin(2 * math.pi * freq * t) * env * volume
            samples.append(int(max(-1, min(1, value)) * 32767))
        for _ in range(int(RATE * gap)):
            samples.append(0)
    with wave.open(path, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes(b"".join(int(v).to_bytes(2, "little", signed=True) for v in samples))


os.makedirs(OUT, exist_ok=True)
tone(os.path.join(OUT, "ui-send.wav"), [(680, 0.055), (860, 0.07)], volume=0.13)
tone(os.path.join(OUT, "ui-sent.wav"), [(880, 0.07), (1175, 0.11)], volume=0.15)
tone(os.path.join(OUT, "ui-typing.wav"), [(520, 0.035)], volume=0.07)
tone(os.path.join(OUT, "ui-typing-stop.wav"), [(420, 0.055)], volume=0.055)
tone(os.path.join(OUT, "ui-error.wav"), [(420, 0.09), (300, 0.12)], volume=0.14, gap=0.012)
