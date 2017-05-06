#!/usr/bin/env python3

import os
import subprocess
import signal
from i3_lemonbar_conf import *


def cleanup(app):
    """Kill all running instances of app"""
    processes = subprocess.check_output('ps -e', shell=True)
    if app in processes.decode():
        pids = subprocess.check_output('pidof ' + app, shell=True)
        subprocess.run(['kill'] + pids.decode().split())
        # for pid in pids.decode().split():
        #     print(int(pid))
        #     os.killpg(int(pid), signal.SIGTERM)


# Before starting new lemonbar delete
# all currently running lemonbars and trayers
cleanup('lemonbar')
cleanup('trayer')

cwd = os.path.dirname(os.path.abspath(__file__))
lemon = "./lemonbar -p -f '%s' -f '%s' -g '%s' -B '%s' -F '%s'" % (
    font, iconfont, geometry, color_background, color_foreground
)
feed = "python3 -c 'import i3_lemonbar_feeder; i3_lemonbar_feeder.run()'"

check_output('cd %s; %s | %s' % (cwd, feed, lemon), shell=True)
