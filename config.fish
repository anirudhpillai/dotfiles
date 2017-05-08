# Path to Oh My Fish install.
set -q XDG_DATA_HOME
  and set -gx OMF_PATH "$XDG_DATA_HOME/omf"
  or set -gx OMF_PATH "$HOME/.local/share/omf"

# Load Oh My Fish configuration.
source $OMF_PATH/init.fish

# Don't need a greeting
function fish_greeting -d "what's up, fish?"
end

# Don't want it to show timestamps
function fish_right_prompt -d "Write out the right prompt"
    # date '+%H:%M'
end


# Aliases
alias d="cd ~/Desktop"
alias dw="cd ~/Downloads"
alias e="emacs -nw"
alias gc="google-chrome-stable"

# Git Aliases
alias g="git"

# Readline colors
set -g fish_color_command white
set -g fish_color_error red
set -g fish_color_quote cyan
set -g fish_color_param white
set -g fish_color_valid_path
# set -g fish_color_param d7af5f

set -g theme_color_scheme solarized
