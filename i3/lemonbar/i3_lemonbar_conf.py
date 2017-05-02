#!/usr/bin/env python3

from subprocess import check_output


# Appearance
geometry = "x16"
width = int(check_output("xrandr | grep current | awk '{print $8a}'", shell=True))

font = "Droid Sans Mono for Powerline:style=Regular:size=9"
iconfont = "FontAwesome-10"

color_background = "#141C24"  # Default background
color_foreground = "#D9D9D9"  # Light text color

color_default = "#6DACA4"  # Default Shade, cyan
color_default_light = "#B8D6D3"

dark_grey = "#2D3740"

color_battery_charging = "#7AB87A"
color_battery_critical = "#C75646"
color_battery_mid = "#C75646"
color_battery_high = "#E09690"

color_volume = "#7A7AB8"  # calm blue

# default space between sections
if width > 1024:
    stab = '  '
else:
    stab = ' '

# Char glyps for powerline fonts
sep_left = ""                     # Powerline separator left
sep_right = ""                    # Powerline separator right
sep_l_left = ""                   # Powerline light separator left
sep_l_right = ""                  # Powerline light sepatator right


# icon_prog = "Â"                    # Window icon
# icon_wsp = "É"                     # Workspace icon
icon_wsp = ""
