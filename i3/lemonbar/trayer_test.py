import subprocess
import time
from signal import SIGTERM
import os


trayer = "trayer --height 15 --edge top --align center --SetDockType false --expand false --widthtype request  --transparent true --alpha 0  --tint 0x141C24"

process = subprocess.Popen(
    trayer,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    shell=True,
    preexec_fn=os.setsid
)

time.sleep(5)

os.killpg(process.pid, SIGTERM)
