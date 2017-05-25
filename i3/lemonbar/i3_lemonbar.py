#!/usr/bin/env python3

import os
from i3_lemonbar_conf import *
from helpers import *


# Before starting new lemonbar delete
# all currently running lemonbars and trayers
cleanup('lemonbar')
cleanup('trayer')

cwd = os.path.dirname(os.path.abspath(__file__))
lemon = "./lemonbar -p -f '%s' -f '%s' -g '%s' -B '%s' -F '%s'" % (
    font, iconfont, geometry, color_background, color_foreground
)
feed = "python3 i3_lemonbar_feeder.py"

check_output('cd %s; %s | %s' % (cwd, feed, lemon), shell=True)
