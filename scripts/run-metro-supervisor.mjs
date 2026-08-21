import { spawn } from "node:child_process";

const port = process.env.EXPO_PORT || "8081";
let activeChild;
let stopping = false;

function startMetro() {
  activeChild = spawn("npx", ["expo", "start", "--web", "--port", port], {
    stdio: "inherit",
    env: { ...process.env, EXPO_NO_METRO_WORKSPACE_ROOT: "1" },
  });

  activeChild.once("exit", (code, signal) => {
    if (stopping) return;
    const reason = signal ?? code ?? "tidak diketahui";
    console.warn(`[metro-supervisor] Metro berhenti (${reason}); memulai ulang dalam 2 detik.`);
    setTimeout(startMetro, 2000);
  });
}

function stop(signal) {
  stopping = true;
  if (activeChild && !activeChild.killed) activeChild.kill(signal);
  process.exit(0);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
startMetro();
