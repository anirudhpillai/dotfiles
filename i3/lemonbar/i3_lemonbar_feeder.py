#!/usr/bin/env python3

import os
import re
import sys
import time
import i3ipc
import threading
import subprocess
from helpers import *
from i3_lemonbar_conf import *


class LemonBar:
    def __init__(self, i3):
        self.i3 = i3

    def render_workspaces(self, display):
        wsp_icon = "%%{F%s B%s} %%{T2}%s%%{T1}" % (
            color_background,
            color_default,
            icon_wsp
        )

        wsp_items = ''

        for wsp in self.i3.get_workspaces():
            wsp_name = wsp['name']
            wsp_action = "%%{A:i3-msg workspace %s}" % wsp_name

            if wsp['output'] != display and not wsp['urgent']:
                continue

            if wsp['focused']:
                # Possibly add dark red tint if urgent
                wsp_items += "%%{F%s B%s}%s%s%%{F%s B%s T1} %s %%{F%s B%s}%s%%{A}" % (
                    color_default,
                    color_default_light,
                    sep_right,
                    wsp_action,
                    color_background,
                    color_default_light,
                    wsp_name,
                    color_default_light,
                    color_default,
                    sep_right
                )
            elif wsp['urgent']:
                wsp_items += "%%{F%s B%s}%s%s%%{F%s B%s T1} %s %%{F%s B%s}%s%%{A}" % (
                    color_default,
                    color_focus,
                    sep_right,
                    wsp_action,
                    color_background,
                    color_focus,
                    wsp_name,
                    color_focus,
                    color_default,
                    sep_right
                )
            else:
                wsp_items += "%s%%{F%s T1} %s%%{A} " % (
                    wsp_action,
                    color_background,
                    wsp_name
                )

        return '%s%s' % (wsp_icon, wsp_items)

    def render_focused_title(self):
        return "%%{F%s B%s}%s%%{F%s B%s T2} %s %%{F%s B-}%s%%{F- B- T1} %s" % (
            color_default,
            dark_grey,
            sep_right,
            color_default,
            dark_grey,
            "",
            dark_grey,
            sep_right,
            # self.focusedWinTitle
            ""
        )

    def render_datetime(self):
        cdate = "%%{F%s}%s%%{F%s B%s} %%{T2}%%{F- T1} %s" % (
            dark_grey,
            sep_left,
            dark_grey,
            dark_grey,
            time.strftime("%a %d/%m/%Y")
        )

        ctime = "%%{F%s}%s%%{F%s B%s} %s %%{F- B-}" % (
            color_default,
            sep_left,
            color_background,
            color_default,
            time.strftime("%H:%M:%S")
        )

        return "%s%s%s" % (cdate, stab, ctime)

    def render_battery(self):
        acpi = subprocess.check_output('acpi').decode().split()
        status = acpi[2][:-1]
        level = int(acpi[3].rstrip("%,"))

        if status == "Charging":
            color_default = color_battery_charging
            level = " %s" % level
        else:
            if level < 35:
                if level < 25:
                    subprocess.call(["pkill", "notify-osd"])
                    subprocess.call(["notify-send", "Battery Low", "Plug it in!"])
                color_default = color_battery_critical
                level = " Stop Playing with Fire and PLUG IT IN! %s" % level
            elif level < 50:
                level = " %s" % level
                color_default = color_battery_mid
            else:
                level = " %s" % level
                color_default = color_battery_high

        level = "%%{F%s}%s%%{F%s B%s} %s %%{F- T1}" % (
            color_default,
            sep_left,
            color_background,
            color_default,
            str(level) + "%"
        )

        return "%s" % (level)

    def render_volume(self):
        amixer = subprocess.check_output("amixer get Master", shell=True).decode()
        match = re.search("\[(\d+)%\]", amixer)
        level = int(match.group(1))

        level = "%%{F%s}%s%%{F%s B%s}  %s %%{F- T1}" % (
            color_volume,
            sep_left,
            color_background,
            color_volume,
            str(level) + "%"
        )

        return "%s" % (level)

    def render(self, caller=None, e=None):
        # Render one bar per each output
        out = ''
        outputs = [out.name for out in self.i3.get_outputs() if out['active']]
        for idx, output in enumerate(outputs):
            out += "%%{S%d}%%{l}%s%s%%{r}%s%s%s" % (
                idx,
                self.render_workspaces(display=output),
                self.render_focused_title(),
                self.render_volume(),
                self.render_battery(),
                self.render_datetime()
            )
        print(out)
        sys.stdout.flush()


def shutdown():
    cleanup('lemonbar')
    cleanup('trayer')


def main():
    i3 = i3ipc.Connection()
    i3thread = threading.Thread(target=i3.main)
    lemonbar = LemonBar(i3)
    lemonbar.render()

    trayer = "trayer --height 15 --edge top --align center --SetDockType false --expand false --widthtype request  --transparent true --alpha 0  --tint 0x141C24"

    process = subprocess.Popen(
        trayer,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True,
        preexec_fn=os.setsid
    )

    # Watch for i3 actions
    i3.on('workspace::focus', lemonbar.render)
    i3.on('window::urgent',   lemonbar.render)
    i3.on('binding',   lemonbar.render)
    i3.on('ipc-shutdown',     shutdown)

    def loop():
        lemonbar.render()
        threading.Timer(2, loop).start()

    i3thread.daemon = True
    i3thread.start()

    loop()


main()
