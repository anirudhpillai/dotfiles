#!/usr/bin/env python3

import subprocess


acpi = subprocess.check_output('acpi').decode().split()
status = acpi[2][:-1]
level = int(acpi[3].rstrip("%,"))

if status != "Charging" and level < 25:
    subprocess.run(["sudo", "/usr/local/bin/set_brightness", "0.05"])
    if level < 20:
        subprocess.call(["pkill", "notify-osd"])
        subprocess.call(["notify-send", "Battery Low", "Plug it in!"])
