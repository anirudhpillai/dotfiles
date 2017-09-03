#!/usr/bin/env python3

import subprocess


acpi = subprocess.check_output('acpi').decode().split()
status = acpi[2][:-1]
level = int(acpi[3].rstrip("%,"))

if status != "Charging" and level < 35:
    subprocess.run(["xbacklight", "-set", "25"])
    if level < 25:
        subprocess.call(["pkill", "notify-osd"])
        subprocess.call(["notify-send", "Battery Low", "Plug it in!"])
