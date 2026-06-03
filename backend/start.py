"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║          ░█████╗░██╗    ░██████╗░███╗░░░███╗░█████╗░██████╗░████████╗       ║
║          ██╔══██╗██║    ██╔════╝░████╗░████║██╔══██╗██╔══██╗╚══██╔══╝       ║
║          ███████║██║    ╚█████╗░ ██╔████╔██║███████║██████╔╝   ██║          ║
║          ██╔══██║██║     ╚═══██╗ ██║╚██╔╝██║██╔══██║██╔══██╗   ██║          ║
║          ██║  ██║██║    ██████╔╝ ██║ ╚═╝ ██║██║  ██║██║  ██║   ██║          ║
║          ╚═╝  ╚═╝╚═╝    ╚═════╝  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝          ║
║                                                                              ║
║                  C A R E E R   N A V I G A T O R   v 2 . 0                  ║
║              Production-Grade Orchestration Engine  ·  CLI Runner            ║
╚══════════════════════════════════════════════════════════════════════════════╝

  Author   : AI Smart Career Navigator Team
  Purpose  : Production service orchestrator — FastAPI + Celery
  Style    : Claude CLI / Gemini CLI inspired — animated, professional
"""

import subprocess
import sys
import os
import signal
import time
import threading
import re
import shutil
import itertools
from datetime import datetime
from typing import Optional

# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 1 ── ANSI ENGINE (TrueColor + Styles)
# ══════════════════════════════════════════════════════════════════════════════

class ANSI:
    """Full TrueColor ANSI escape engine with hex-to-RGB conversion."""

    RESET       = "\033[0m"
    BOLD        = "\033[1m"
    DIM         = "\033[2m"
    ITALIC      = "\033[3m"
    UNDERLINE   = "\033[4m"
    BLINK_SLOW  = "\033[5m"
    INVERSE     = "\033[7m"
    STRIKE      = "\033[9m"
    R           = "\033[0m"

    @staticmethod
    def rgb(r: int, g: int, b: int) -> str:
        return f"\033[38;2;{r};{g};{b}m"

    @staticmethod
    def bg_rgb(r: int, g: int, b: int) -> str:
        return f"\033[48;2;{r};{g};{b}m"

    @staticmethod
    def hex(h: str) -> str:
        h = h.lstrip("#")
        return ANSI.rgb(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

    @staticmethod
    def bg_hex(h: str) -> str:
        h = h.lstrip("#")
        return ANSI.bg_rgb(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

    @staticmethod
    def strip(s: str) -> str:
        return re.sub(r"\033\[[0-9;]*[mGKHF]", "", s)

    @staticmethod
    def visible_len(s: str) -> int:
        return len(ANSI.strip(s))


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 2 ── DESIGN TOKENS  (Deep Space Intelligence Theme)
# ══════════════════════════════════════════════════════════════════════════════

class T:
    """Design token palette — Deep Space Intelligence Theme."""

    # ── Surface ──────────────────────────────────────────────────────────────
    BG          = "#07070F"
    SURFACE_0   = "#0C0C1A"
    SURFACE_1   = "#111124"
    SURFACE_2   = "#18182E"
    SURFACE_3   = "#222238"
    SURFACE_4   = "#2E2E48"
    BORDER      = "#2A2A40"
    BORDER_SOFT = "#1E1E32"

    # ── Brand ─────────────────────────────────────────────────────────────────
    VIOLET_CORE   = "#7C3AED"
    VIOLET_BRIGHT = "#8B5CF6"
    VIOLET_GLOW   = "#A78BFA"
    VIOLET_MUTED  = "#4C1D95"
    VIOLET_SOFT   = "#C4B5FD"

    # ── Semantic ──────────────────────────────────────────────────────────────
    SUCCESS      = "#10B981"
    SUCCESS_SOFT = "#6EE7B7"
    ERROR        = "#F43F5E"
    ERROR_SOFT   = "#FDA4AF"
    WARN         = "#F59E0B"
    WARN_SOFT    = "#FCD34D"
    INFO         = "#22D3EE"
    INFO_SOFT    = "#A5F3FC"
    PENDING      = "#A78BFA"
    HOLD         = "#6B7280"

    # ── Text ──────────────────────────────────────────────────────────────────
    TEXT_1   = "#EEEAF8"
    TEXT_2   = "#9D99B8"
    TEXT_3   = "#5C5A78"
    TEXT_4   = "#3A3855"

    # ── HTTP Method Colors ────────────────────────────────────────────────────
    HTTP_GET    = "#22D3EE"
    HTTP_POST   = "#10B981"
    HTTP_PUT    = "#F59E0B"
    HTTP_DELETE = "#F43F5E"
    HTTP_PATCH  = "#A78BFA"

def f(h):  return ANSI.hex(h)
def b(h):  return ANSI.bg_hex(h)
R  = ANSI.R
BD = ANSI.BOLD
DM = ANSI.DIM
IT = ANSI.ITALIC
UL = ANSI.UNDERLINE


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 3 ── TERMINAL UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

def term_width() -> int:
    try:
        return shutil.get_terminal_size().columns
    except Exception:
        return 120

def erase_line():
    print("\033[2K\r", end="", flush=True)

def hide_cursor():
    print("\033[?25l", end="", flush=True)

def show_cursor():
    print("\033[?25h", end="", flush=True)

def center_str(s: str, width: Optional[int] = None) -> str:
    w = width or term_width()
    vis = ANSI.visible_len(s)
    pad = max(0, (w - vis) // 2)
    return " " * pad + s

def rpad(s: str, target_len: int) -> str:
    vis = ANSI.visible_len(s)
    return s + " " * max(0, target_len - vis)

def divider(char: str = "─", color: str = T.BORDER, width: Optional[int] = None):
    w = width or term_width()
    print(f"{f(color)}{char * w}{R}")

def thin_div(color: str = T.BORDER_SOFT):
    divider("╌", color)

def double_div(color: str = T.VIOLET_CORE):
    divider("═", color)


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 4 ── ANIMATED COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════

class Spinner:
    """Inline animated spinner — Claude CLI style."""

    FRAMES_DOTS  = ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"]
    FRAMES_PULSE = ["◌","◎","◉","●","◉","◎"]
    FRAMES_ARC   = ["◜","◝","◞","◟"]
    FRAMES_LINE  = ["─","╲","│","╱"]

    def __init__(self, message: str, style: str = "dots", color: str = T.VIOLET_GLOW):
        self.message = message
        self.frames  = getattr(self, f"FRAMES_{style.upper()}", self.FRAMES_DOTS)
        self.color   = color
        self._stop   = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)

    def _run(self):
        hide_cursor()
        for frame in itertools.cycle(self.frames):
            if self._stop.is_set():
                break
            erase_line()
            print(
                f"  {f(self.color)}{frame}{R}  "
                f"{f(T.TEXT_2)}{self.message}{R}",
                end="", flush=True
            )
            time.sleep(0.09)

    def start(self):
        self._thread.start()
        return self

    def stop(self, success: bool = True, final_msg: Optional[str] = None):
        self._stop.set()
        self._thread.join(timeout=0.5)
        erase_line()
        icon  = f"{f(T.SUCCESS)}{BD}✔{R}" if success else f"{f(T.ERROR)}{BD}✖{R}"
        msg   = final_msg or self.message
        color = T.SUCCESS if success else T.ERROR
        print(f"  {icon}  {f(color)}{msg}{R}")
        show_cursor()


def typewriter(text: str, delay: float = 0.016):
    """Print text character by character, respecting ANSI codes."""
    i = 0
    while i < len(text):
        if text[i] == "\033":
            j = i + 1
            while j < len(text) and text[j] not in "mGKHF":
                j += 1
            print(text[i:j+1], end="", flush=True)
            i = j + 1
        else:
            print(text[i], end="", flush=True)
            i += 1
            time.sleep(delay)
    print()


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 5 ── BANNER & BOOT SEQUENCE
# ══════════════════════════════════════════════════════════════════════════════

LOGO_LINES = [
    r"    ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗     ███╗   ██╗ █████╗ ██╗   ██╗",
    r"   ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ████╗  ██║██╔══██╗██║   ██║",
    r"   ██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██╔██╗ ██║███████║██║   ██║",
    r"   ██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║╚██╗██║██╔══██║╚██╗ ██╔╝",
    r"   ╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ██║ ╚████║██║  ██║ ╚████╔╝ ",
    r"    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝ ",
]

GRADIENT = [
    T.VIOLET_MUTED, T.VIOLET_MUTED,
    T.VIOLET_CORE,  T.VIOLET_BRIGHT,
    T.VIOLET_BRIGHT, T.VIOLET_GLOW,
]

def print_banner():
    w = term_width()
    double_div(T.VIOLET_MUTED)
    print()

    for i, line in enumerate(LOGO_LINES):
        color = GRADIENT[min(i, len(GRADIENT) - 1)]
        print(center_str(f"{f(color)}{BD}{line}{R}", w))
        time.sleep(0.045)

    print()

    tagline = (
        f"{f(T.INFO)}✦{R}  "
        f"{f(T.TEXT_1)}{BD}AI Smart Career Navigator{R}  "
        f"{f(T.TEXT_3)}·{R}  "
        f"{f(T.VIOLET_SOFT)}Production Orchestrator  v2.0{R}  "
        f"{f(T.INFO)}✦{R}"
    )
    print(center_str(tagline, w))
    time.sleep(0.05)

    sub = f"{f(T.TEXT_3)}{IT}FastAPI Gateway  ·  Celery Workers  ·  Deep Space Intelligence Engine{R}"
    print(center_str(sub, w))
    print()
    double_div(T.VIOLET_MUTED)
    print()


def print_boot_checklist():
    """Claude-CLI-style animated boot checklist."""
    checks = [
        "Runtime environment",
        "Virtual environment scanner",
        "Service definitions",
        "Signal handlers",
        "Process monitors",
        "Log parsers",
        "Health watchdog",
        "TrueColor terminal support",
    ]

    print(f"  {f(T.TEXT_3)}{DM}Initializing subsystems…{R}\n")
    time.sleep(0.08)

    for label in checks:
        print(f"  {f(T.HOLD)}{DM}○{R}  {f(T.TEXT_3)}{label}…{R}", end="\r", flush=True)
        time.sleep(0.17)
        erase_line()
        print(f"  {f(T.SUCCESS)}{BD}✔{R}  {f(T.TEXT_2)}{label}{R}  {f(T.TEXT_4)}{DM}ready{R}")

    print()


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 6 ── BADGE ENGINE
# ══════════════════════════════════════════════════════════════════════════════

def make_badge(text: str, bg_hex: str, fg_hex: str = T.TEXT_1, bold: bool = True) -> str:
    style = BD if bold else ""
    return f"{b(bg_hex)}{f(fg_hex)}{style} {text} {R}"


BADGES = {
    # ── Service tags ──────────────────────────────────────────────
    "GATEWAY":  make_badge(" GATEWAY ", T.VIOLET_CORE,   T.TEXT_1),
    "CELERY":   make_badge("  CELERY ", T.VIOLET_MUTED,  T.VIOLET_SOFT),
    "SYSTEM":   make_badge("  SYSTEM ", T.SURFACE_3,     T.INFO),
    "MONITOR":  make_badge(" MONITOR ", T.SURFACE_2,     T.TEXT_3),

    # ── Status ────────────────────────────────────────────────────
    "SUCCESS":  make_badge(" ✓ SUCCESS ", T.SUCCESS,      T.BG),
    "ERROR":    make_badge(" ✖ ERROR   ", T.ERROR,        T.TEXT_1),
    "WARN":     make_badge(" ⚠ WARN    ", T.WARN,         T.BG),
    "INFO":     make_badge(" ● INFO    ", T.SURFACE_3,    T.INFO),
    "PENDING":  make_badge(" ◎ PENDING ", T.SURFACE_4,    T.PENDING),
    "HOLD":     make_badge(" ⏸ HOLD    ", T.SURFACE_2,    T.HOLD),
    "TASK":     make_badge(" ◆ TASK    ", T.SURFACE_3,    T.VIOLET_GLOW),
    "READY":    make_badge(" ★ READY   ", T.SUCCESS,      T.BG),
    "SPAWN":    make_badge(" ⚡ SPAWN   ", T.VIOLET_CORE,  T.TEXT_1),
    "SHUTDOWN": make_badge(" ⏹ SHUTDOWN", T.ERROR,        T.TEXT_1),
    "RETRY":    make_badge(" ↺ RETRY   ", T.WARN,         T.BG),
    "BOOT":     make_badge(" ◈ BOOT    ", T.VIOLET_BRIGHT,T.BG),
    "HTTP":     make_badge(" ⇄ HTTP    ", T.SURFACE_4,    T.INFO_SOFT),
}


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 7 ── STRUCTURED LOG ENGINE
# ══════════════════════════════════════════════════════════════════════════════

_log_lock    = threading.Lock()
_session_start: float = 0.0
_log_count: dict = {"total": 0, "errors": 0, "warns": 0}


def _timestamp() -> str:
    now = datetime.now()
    return (
        f"{f(T.TEXT_4)}{DM}{now.strftime('%H:%M:%S')}"
        f"{f(T.TEXT_3)}.{now.strftime('%f')[:-3]}{R}"
    )


def _uptime() -> str:
    if _session_start:
        d = int(time.time() - _session_start)
        h, rem = divmod(d, 3600)
        m, s   = divmod(rem, 60)
        return f"{f(T.TEXT_4)}{DM}+{h:02d}:{m:02d}:{s:02d}{R}"
    return f"{f(T.TEXT_4)}{DM}+00:00:00{R}"


def log(service: str, status: str, message: str,
        detail: Optional[object] = None):
    """Core structured log emitter."""
    with _log_lock:
        _log_count["total"] += 1
        if status == "ERROR":   _log_count["errors"] += 1
        elif status == "WARN":  _log_count["warns"]  += 1

        svc_badge    = BADGES.get(service, make_badge(f" {service[:7]:^7} ", T.SURFACE_2, T.TEXT_3))
        status_badge = BADGES.get(status,  BADGES["INFO"])
        sep = f" {f(T.TEXT_4)}│{R} "

        print(f" {_timestamp()}{sep}{_uptime()}{sep}{svc_badge}{sep}{status_badge}{sep} {message}")

        if detail:
            details = detail if isinstance(detail, list) else [detail]
            for d in details:
                print(f"   {'':>36} {f(T.TEXT_4)}│{R}   {f(T.TEXT_3)}{DM}↳  {d}{R}")


def section_header(title: str, icon: str = "◈", subtitle: str = ""):
    print()
    accent = f"{f(T.VIOLET_CORE)}▌{R}{b(T.SURFACE_1)}{f(T.VIOLET_GLOW)}{BD}  {icon}  {title}  {R}"
    print(accent)
    if subtitle:
        print(f"   {f(T.TEXT_3)}{IT}{subtitle}{R}")
    thin_div(T.SURFACE_3)


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 8 ── INTELLIGENT LOG PARSER
# ══════════════════════════════════════════════════════════════════════════════

HTTP_COLORS = {
    "GET":    T.HTTP_GET,
    "POST":   T.HTTP_POST,
    "PUT":    T.HTTP_PUT,
    "DELETE": T.HTTP_DELETE,
    "PATCH":  T.HTTP_PATCH,
}

def _http_code_color(code: str) -> str:
    if   code.startswith("2"): return T.SUCCESS
    elif code.startswith("3"): return T.WARN
    else:                       return T.ERROR

_traceback_buf: dict = {"GATEWAY": [], "CELERY": []}
_in_traceback:  dict = {"GATEWAY": False, "CELERY": False}


def _flush_traceback(service: str):
    buf = _traceback_buf[service]
    if buf:
        log(service, "ERROR",
            f"{f(T.ERROR)}{BD}Exception traceback captured{R}",
            buf[-6:])
        buf.clear()
    _in_traceback[service] = False


def parse_line(raw: str, service: str) -> None:
    """Route raw subprocess output to styled log entries."""
    line     = raw.rstrip("\n").rstrip("\r")
    stripped = line.strip()
    if not stripped:
        return
    low = stripped.lower()

    # ── Multi-line traceback accumulation ────────────────────────
    if "traceback (most recent call last)" in low:
        _in_traceback[service] = True
        _traceback_buf[service].clear()
        _traceback_buf[service].append(stripped)
        return

    if _in_traceback[service]:
        _traceback_buf[service].append(stripped)
        if not stripped.startswith(" ") and not stripped.startswith("File ") and ":" in stripped:
            _flush_traceback(service)
        return

    # ════════════════════════════════════════════════════════
    #   GATEWAY — Uvicorn / FastAPI
    # ════════════════════════════════════════════════════════

    if "application startup complete" in low:
        log("GATEWAY", "READY",
            f"{f(T.SUCCESS)}{BD}🚀  FastAPI application started successfully{R}",
            ["Event: Application startup complete"])
        return

    if "started server process" in low:
        pid_m = re.search(r"\[(\d+)\]", stripped)
        pid = pid_m.group(1) if pid_m else "?"
        log("GATEWAY", "SPAWN",
            f"{f(T.VIOLET_BRIGHT)}{BD}Server process launched{R}  "
            f"{f(T.TEXT_3)}PID {f(T.VIOLET_GLOW)}{pid}{R}")
        return

    if "uvicorn running" in low or "listening on" in low:
        url_m = re.search(r"(https?://[\w.:\-]+)", stripped)
        url   = url_m.group(1) if url_m else "http://0.0.0.0:8000"
        log("GATEWAY", "READY",
            f"{f(T.INFO)}{BD}🌐  Accepting connections  →  {UL}{url}{R}",
            [f"Socket: {stripped}"])
        return

    # HTTP access log
    http_m = re.search(
        r'"(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(\S+)\s+HTTP/[\d.]+"\s+(\d{3})\s+(\d+)',
        stripped
    )
    if http_m:
        method, path, code, size = http_m.groups()
        mc  = HTTP_COLORS.get(method, T.TEXT_2)
        cc  = _http_code_color(code)
        dur = re.search(r"([\d.]+)\s*ms", stripped)
        dur_str = f"  {f(T.TEXT_4)}{DM}{dur.group(1)}ms{R}" if dur else ""
        log("GATEWAY", "HTTP",
            f"{b(T.SURFACE_1)}{f(mc)}{BD} {method:<7}{R}  "
            f"{rpad(f(T.TEXT_1) + path + R, 52)}  "
            f"{b(T.SURFACE_2)}{f(cc)}{BD} {code} {R}  "
            f"{f(T.TEXT_3)}{size}B{R}{dur_str}")
        return

    if "reloading" in low or "started reloader process" in low or "watchfiles" in low:
        log("GATEWAY", "WARN",
            f"{f(T.WARN)}🔄  Hot-reloader activated{R}", [stripped])
        return

    if "shutdown" in low and service == "GATEWAY":
        log("GATEWAY", "SHUTDOWN",
            f"{f(T.ERROR)}🛑  Gateway shutdown initiated{R}")
        return

    if "error" in low and service == "GATEWAY":
        log("GATEWAY", "ERROR",
            f"{f(T.ERROR)}{BD}Gateway error{R}", [stripped])
        return

    if ("warn" in low or "warning" in low) and service == "GATEWAY":
        log("GATEWAY", "WARN", f"{f(T.WARN)}Gateway warning{R}", [stripped])
        return

    # ════════════════════════════════════════════════════════
    #   CELERY Worker
    # ════════════════════════════════════════════════════════

    if "celery@" in low and "ready" in low:
        wn = re.search(r"celery@([\w\-.]+)", stripped, re.IGNORECASE)
        wname = wn.group(1) if wn else "worker"
        log("CELERY", "READY",
            f"{f(T.SUCCESS)}{BD}👷  Worker node ready  →  {f(T.VIOLET_SOFT)}{wname}{R}")
        return

    if "connected to" in low:
        bk = re.search(r"connected to (.+)", stripped, re.IGNORECASE)
        broker = bk.group(1).strip().rstrip(".") if bk else "broker"
        log("CELERY", "SUCCESS",
            f"{f(T.SUCCESS)}🔌  Broker connection established  →  {f(T.INFO)}{broker}{R}")
        return

    if "task received" in low or ("received" in low and "task" in low and "[" in stripped):
        tm = re.search(r"([\w.]+)\[([a-f0-9\-]+)\]", stripped)
        if tm:
            tname, tid = tm.groups()
            eta_m = re.search(r"eta:([^\s]+)", stripped, re.IGNORECASE)
            eta_s = f"  {f(T.TEXT_3)}ETA {f(T.WARN)}{eta_m.group(1)}{R}" if eta_m else ""
            log("CELERY", "PENDING",
                f"{f(T.PENDING)}⏳  Task queued  →  {f(T.VIOLET_SOFT)}{BD}{tname}{R}  "
                f"{f(T.TEXT_4)}{DM}[{tid[:8]}…]{R}{eta_s}")
        else:
            log("CELERY", "PENDING", f"{f(T.PENDING)}⏳  Task received{R}", [stripped])
        return

    if ("succeeded" in low or "task success" in low) and service == "CELERY":
        tm   = re.search(r"([\w.]+)\[([a-f0-9\-]+)\]", stripped)
        rt_m = re.search(r"runtime[=:\s]+([\d.]+)", stripped, re.IGNORECASE)
        tname  = tm.group(1) if tm else "task"
        rt_str = ""
        if rt_m:
            ms = float(rt_m.group(1))
            rc = T.SUCCESS if ms < 500 else (T.WARN if ms < 2000 else T.ERROR)
            rt_str = f"  {f(T.TEXT_3)}in{R}  {f(rc)}{BD}{ms:.0f}ms{R}"
        log("CELERY", "SUCCESS",
            f"{f(T.SUCCESS)}✔  Task completed  →  {f(T.VIOLET_SOFT)}{BD}{tname}{R}{rt_str}")
        return

    if ("failed" in low or "task-failure" in low) and service == "CELERY":
        tm    = re.search(r"([\w.]+)\[([a-f0-9\-]+)\]", stripped)
        tname = tm.group(1) if tm else "task"
        exc_m = re.search(r"exc=(.+?)(?:\s+traceback|$)", stripped, re.IGNORECASE)
        exc_s = exc_m.group(1).strip() if exc_m else ""
        log("CELERY", "ERROR",
            f"{f(T.ERROR)}{BD}✖  Task failed  →  {f(T.ERROR_SOFT)}{tname}{R}",
            [f"Exception: {exc_s}"] if exc_s else [stripped])
        return

    if "retry" in low and service == "CELERY":
        tm    = re.search(r"([\w.]+)\[([a-f0-9\-]+)\]", stripped)
        tname = tm.group(1) if tm else "task"
        cd_m  = re.search(r"eta:([^\s]+)", stripped, re.IGNORECASE)
        cd_s  = f"  {f(T.TEXT_3)}next at{R}  {f(T.WARN)}{cd_m.group(1)}{R}" if cd_m else ""
        log("CELERY", "RETRY",
            f"{f(T.WARN)}↺  Scheduling retry  →  {f(T.WARN_SOFT)}{tname}{R}{cd_s}")
        return

    if "revoked" in low and service == "CELERY":
        log("CELERY", "HOLD",
            f"{f(T.HOLD)}⏸  Task revoked / cancelled{R}", [stripped])
        return

    if "consuming from" in low:
        q_m = re.search(r"consuming from (.+)", stripped, re.IGNORECASE)
        qs  = q_m.group(1).strip() if q_m else "queues"
        log("CELERY", "INFO",
            f"{f(T.INFO)}⚡  Queue consumer active  →  {f(T.VIOLET_SOFT)}{qs}{R}")
        return

    if "concurrency" in low or ("pool" in low and "processes" in low):
        cm = re.search(r"concurrency:\s*(\d+)", stripped, re.IGNORECASE)
        cc = cm.group(1) if cm else "?"
        log("CELERY", "INFO",
            f"{f(T.INFO)}⚙  Worker pool ready  —  concurrency {f(T.VIOLET_GLOW)}{BD}{cc}{R}")
        return

    if "error" in low and service == "CELERY":
        log("CELERY", "ERROR", f"{f(T.ERROR)}Celery error{R}", [stripped])
        return

    if ("warn" in low or "warning" in low) and service == "CELERY":
        log("CELERY", "WARN", f"{f(T.WARN)}Celery warning{R}", [stripped])
        return

    if "exception" in low and service == "CELERY":
        log("CELERY", "ERROR",
            f"{f(T.ERROR)}{BD}🔥  Worker exception{R}", [stripped])
        return

    # ── Generic passthrough ───────────────────────────────────────
    svc_c = T.VIOLET_BRIGHT if service == "GATEWAY" else T.VIOLET_CORE
    print(
        f" {_timestamp()} {f(T.TEXT_4)}│{R} "
        f"{f(svc_c)}{DM}[{service}]{R}  "
        f"{f(T.TEXT_4)}{DM}{stripped}{R}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 9 ── STREAM READER THREAD
# ══════════════════════════════════════════════════════════════════════════════

def stream_reader(process: subprocess.Popen, service: str):
    for line in iter(process.stdout.readline, ""):
        if line == "" and process.poll() is not None:
            break
        parse_line(line, service)
    if _in_traceback.get(service):
        _flush_traceback(service)


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 10 ── STEP HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def step_ok(msg: str, sub: str = ""):
    print(f"  {f(T.SUCCESS)}{BD}✔{R}  {f(T.TEXT_1)}{msg}{R}")
    if sub: print(f"     {f(T.TEXT_3)}{DM}{sub}{R}")

def step_fail(msg: str, sub: str = ""):
    print(f"  {f(T.ERROR)}{BD}✖{R}  {f(T.ERROR)}{msg}{R}")
    if sub: print(f"     {f(T.TEXT_3)}{DM}{sub}{R}")

def step_warn(msg: str, sub: str = ""):
    print(f"  {f(T.WARN)}⚠{R}  {f(T.WARN)}{msg}{R}")
    if sub: print(f"     {f(T.TEXT_3)}{DM}{sub}{R}")

def step_key_val(key: str, val: str, val_color: str = T.VIOLET_SOFT):
    print(f"  {f(T.TEXT_4)}▸{R}  {f(T.TEXT_3)}{key:<22}{R}  {f(val_color)}{BD}{val}{R}")


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 11 ── SESSION INFO
# ══════════════════════════════════════════════════════════════════════════════

def print_session_info():
    section_header("Session", "◈", "Runtime environment details")
    now = datetime.now()
    step_key_val("Started",    now.strftime("%A, %d %B %Y"))
    step_key_val("Time",       now.strftime("%H:%M:%S"))
    step_key_val("Platform",   sys.platform.upper())
    step_key_val("Python",     sys.version.split()[0])
    step_key_val("Executable", sys.executable, T.TEXT_2)
    step_key_val("Working dir",os.getcwd(),     T.TEXT_2)
    step_key_val("PID",        str(os.getpid()))
    print()


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 12 ── ENVIRONMENT RESOLUTION
# ══════════════════════════════════════════════════════════════════════════════

def resolve_python_binary() -> str:
    section_header("Environment", "⚙", "Resolving runtime binaries")

    win_venv  = os.path.abspath(os.path.join(os.path.dirname(__file__), ".venv", "Scripts", "python.exe"))
    unix_venv = os.path.abspath(os.path.join(os.path.dirname(__file__), ".venv", "bin", "python"))

    sp = Spinner("Scanning for virtual environment…", style="pulse", color=T.VIOLET_BRIGHT)
    sp.start()
    time.sleep(0.55)

    if os.path.exists(win_venv):
        sp.stop(True, "Virtual environment found  (Windows)")
        step_key_val(".venv path", win_venv, T.TEXT_2)
        python_bin = win_venv
    elif os.path.exists(unix_venv):
        sp.stop(True, "Virtual environment found  (Unix / macOS)")
        step_key_val(".venv path", unix_venv, T.TEXT_2)
        python_bin = unix_venv
    else:
        sp.stop(False, "No .venv found — falling back to system Python")
        step_warn(
            "System interpreter will be used",
            "Run: python -m venv .venv && .venv/bin/pip install -r requirements.txt"
        )
        python_bin = sys.executable

    step_key_val("Resolved binary", python_bin, T.VIOLET_SOFT)
    print()
    return python_bin


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 13 ── SERVICE LAUNCH
# ══════════════════════════════════════════════════════════════════════════════

def launch_services(python_bin: str):
    section_header("Services", "🚀", "Spawning FastAPI + Celery process group")

    gateway_cmd = [python_bin, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    celery_cmd  = [python_bin, "-m", "celery", "-A", "app.tasks", "worker", "--loglevel=info"]
    if os.name == "nt":
        celery_cmd += ["-P", "solo"]
        step_warn("Windows detected — Celery pool forced to solo mode")

    step_key_val("Gateway cmd", " ".join(gateway_cmd[-4:]) + " …", T.TEXT_2)
    step_key_val("Celery cmd",  " ".join(celery_cmd[-5:])  + " …", T.TEXT_2)
    print()

    sp1 = Spinner("Spawning FastAPI Gateway…", style="arc", color=T.INFO)
    sp1.start(); time.sleep(0.4)
    gateway = subprocess.Popen(gateway_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    sp1.stop(True, f"Gateway spawned  —  PID {f(T.VIOLET_GLOW)}{BD}{gateway.pid}{R}")

    sp2 = Spinner("Spawning Celery Workers…", style="arc", color=T.PENDING)
    sp2.start(); time.sleep(0.4)
    celery = subprocess.Popen(celery_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    sp2.stop(True, f"Celery spawned   —  PID {f(T.VIOLET_GLOW)}{BD}{celery.pid}{R}")

    # ── Reader threads ────────────────────────────────────────────
    threading.Thread(target=stream_reader, args=(gateway, "GATEWAY"), daemon=True).start()
    threading.Thread(target=stream_reader, args=(celery,  "CELERY"),  daemon=True).start()

    print()
    step_ok("All threads active — log streams open")
    print()
    return gateway, celery


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 14 ── LIVE STREAM HEADER
# ══════════════════════════════════════════════════════════════════════════════

def print_stream_header():
    double_div(T.VIOLET_CORE)

    sep = f" {f(T.TEXT_4)}│{R} "
    ts_h  = f"{f(T.TEXT_4)}{DM}{'TIMESTAMP':^14}{R}"
    up_h  = f"{f(T.TEXT_4)}{DM}{'UPTIME':^10}{R}"
    sv_h  = f"{f(T.TEXT_3)}{DM}{'SERVICE':^10}{R}"
    st_h  = f"{f(T.TEXT_3)}{DM}{'STATUS':^13}{R}"
    mg_h  = f"{f(T.TEXT_3)}{DM}MESSAGE{R}"
    print(f" {ts_h}{sep}{up_h}{sep}{sv_h}{sep}{st_h}{sep} {mg_h}")

    divider("─", T.SURFACE_4)

    legend = "  ".join([
        BADGES["SUCCESS"], BADGES["ERROR"], BADGES["WARN"],
        BADGES["PENDING"], BADGES["HOLD"],  BADGES["RETRY"],
        BADGES["TASK"],    BADGES["HTTP"],  BADGES["INFO"],
    ])
    print(f"  {f(T.TEXT_4)}{DM}Legend  {R}{legend}")

    double_div(T.VIOLET_CORE)
    print()


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 15 ── GRACEFUL SHUTDOWN HANDLER
# ══════════════════════════════════════════════════════════════════════════════

def build_shutdown_handler(gateway: subprocess.Popen, celery: subprocess.Popen, start: float):
    def handler(signum, frame):
        print()
        double_div(T.ERROR)
        section_header("Shutdown", "⏹", "Terminating all services gracefully")
        log("SYSTEM", "SHUTDOWN",
            f"{f(T.ERROR)}{BD}Signal received  —  initiating graceful shutdown{R}")

        for proc, name in [(gateway, "Gateway"), (celery, "Celery ")]:
            sp = Spinner(f"Terminating {name} (PID {proc.pid})…", color=T.WARN)
            sp.start()
            proc.terminate()
            try:
                proc.wait(timeout=5)
                sp.stop(True, f"{name} stopped  (exit {proc.returncode})")
            except subprocess.TimeoutExpired:
                sp.stop(False, f"{name} unresponsive — force killing")
                proc.kill()

        # ── Session summary ────────────────────────────────────────
        elapsed  = time.time() - start
        h, rem   = divmod(int(elapsed), 3600)
        m, s     = divmod(rem, 60)

        print()
        section_header("Session Summary", "◈")
        step_key_val("Total uptime",     f"{h:02d}h {m:02d}m {s:02d}s",          T.INFO)
        step_key_val("Log entries",      str(_log_count["total"]),                 T.SUCCESS)
        step_key_val("Errors emitted",   str(_log_count["errors"]),
                     T.ERROR if _log_count["errors"] else T.SUCCESS)
        step_key_val("Warnings emitted", str(_log_count["warns"]),
                     T.WARN  if _log_count["warns"]  else T.SUCCESS)
        print()

        double_div(T.ERROR)
        print()
        print(
            f"  {f(T.VIOLET_GLOW)}◈{R}  "
            f"{f(T.TEXT_2)}AI Smart Career Navigator  —  session ended{R}  "
            f"{f(T.TEXT_4)}{DM}{datetime.now().strftime('%H:%M:%S')}{R}"
        )
        print()
        show_cursor()
        sys.exit(0)

    return handler


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 16 ── HEALTH WATCHDOG
# ══════════════════════════════════════════════════════════════════════════════

def health_watchdog(gateway: subprocess.Popen, celery: subprocess.Popen,
                    shutdown_fn, interval: float = 1.0):
    """Polls both processes and triggers shutdown on unexpected exit."""
    while True:
        gp = gateway.poll()
        cp = celery.poll()

        if gp is not None:
            print()
            log("MONITOR", "ERROR",
                f"{f(T.ERROR)}{BD}FastAPI Gateway exited unexpectedly{R}",
                [f"Exit code: {f(T.ERROR)}{gp}{R}",
                 "Review gateway logs above for the root cause."])
            shutdown_fn(None, None)

        if cp is not None:
            print()
            log("MONITOR", "ERROR",
                f"{f(T.ERROR)}{BD}Celery Worker exited unexpectedly{R}",
                [f"Exit code: {f(T.ERROR)}{cp}{R}",
                 "Review celery logs above for the root cause."])
            shutdown_fn(None, None)

        time.sleep(interval)


# ══════════════════════════════════════════════════════════════════════════════
#   SECTION 17 ── MAIN ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    global _session_start

    # Phase 0: Banner
    print_banner()

    # Phase 1: Animated boot checklist
    section_header("Boot", "◈", "Pre-flight subsystem checks")
    print_boot_checklist()

    # Phase 2: Session info table
    print_session_info()

    # Phase 3: Environment resolution
    python_bin = resolve_python_binary()

    # Phase 4: Service launch
    gateway, celery = launch_services(python_bin)

    # Phase 5: Start uptime clock
    _session_start = time.time()

    # Phase 6: Register signal handlers
    shutdown = build_shutdown_handler(gateway, celery, _session_start)
    signal.signal(signal.SIGINT,  shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    # Phase 7: Live stream header
    print_stream_header()

    # Phase 8: Health watchdog (blocks main thread)
    try:
        health_watchdog(gateway, celery, shutdown)
    except KeyboardInterrupt:
        shutdown(None, None)


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    main()