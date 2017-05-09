#!usr/bin/env python3

import subprocess

acpi = subprocess.check_output('acpi').decode().split()
status = acpi[2][:-1]
level = int(acpi[3][0:2])

if status == "Discharging" and level < 35:
    subprocess.call(['notify-send', "Battery Low", "Plug it in!"])
