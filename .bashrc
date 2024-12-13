# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples


######## Universal Options

# if not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# make sure we're always using UTF8
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

# VIM-mode in the prompt (vs. Emacs mode)
#set -o vi

# set vim as the default editor (alt choice: nano)
export EDITOR=vim

# recreate the handy-dandy <C-l> for "clear"
bind -m vi-insert "\C-l":clear-screen

# alias regular 'clear' so as to not clear the scrollback
alias clear='clear -x'

# universal alaises to prevent stupid mistakes
alias cp='cp -i'
alias mv='mv -i'
alias rm='rm -i'

# don't put duplicate lines or lines starting with space in the history.
# see bash(1) for more options
HISTCONTROL=ignoreboth

# save more lines of history than normal
HISTSIZE=1000
HISTFILESIZE=2000

# append to history instead of overwriting it
shopt -s histappend

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
shopt -s globstar

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# Colors for prompts
export C_RST="\[\e[00m\]" #reset all parameters
export C_39="\[\e[39m\]" #default foreground color
# 8/16-color codes
export C_31="\[\e[00;31m\]" #red
export B_32="\[\e[01;32m\]" #bold green
export B_34="\[\e[01;34m\]" #bold blue
export C_36="\[\e[01;36m\]" #bold cyan
export B_97="\[\e[01;97m\]" #bold white
# 256-color codes
export C_124="\[\e[00;38;5;124m\]" #darkish red, #AF0000
export C_242="\[\e[00;38;5;242m\]" #dark gray, #6C6C6C
export C_244="\[\e[00;38;5;244m\]" #mid-dark gray, #808080
export C_246="\[\e[00;38;5;246m\]" #mid-lt gray, #949494
export C_250="\[\e[00;38;5;250m\]" #light gray, #BCBCBC
export B_250="\[\e[01;38;5;250m\]" #bold light gray
# For unsetting later:
export colorvars="C_RST C_39 C_31 B_32 B_34 C_36 B_97 C_124 C_242 C_244 C_246 C_250 B_250"

# silly stuff
alias untar='echo "I AM UNTAR, LORD OF THE UNIVERSE!"'
alias y="echo I\'m sorry Dave, I can\'t do that."
alias :w="echo You\'re not in VIM, dammit!"
alias :wq="echo You\'re not in VIM, dammit!"
alias :q="echo You\'re not in VIM, dammit!"
 

######## OS-specific settings
case $(uname) in
Linux)

    # Get machine name for machine-specific stuff later
    machine=$(hostname)

    # set a fancy prompt (non-color, unless we know we "want" color)
    case "$TERM" in
        xterm-color|*-256color) color_prompt=yes;;
    esac

    # uncomment for a colored prompt, if the terminal has the capability; turned
    # off by default to not distract the user: the focus in a terminal window
    # should be on the output of commands, not on the prompt
    #force_color_prompt=yes

    if [ -n "$force_color_prompt" ]; then
        if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
    	# We have color support; assume it's compliant with Ecma-48
    	# (ISO/IEC-6429). (Lack of such support is extremely rare, and such
    	# a case would tend to support setf rather than setaf.)
    	color_prompt=yes
        else
    	color_prompt=
        fi
    fi

    # get git branch status for prompt, using official script from git
    source /usr/lib/git-core/git-sh-prompt

    # prompt
    if [ "$color_prompt" = yes ]; then
        # basic, with color
        #PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
        #PS1="\${debian_chroot:+($debian_chroot)}${B_32}\u@\h$:${B_34}\w${C_RST}\$ "
        # grayscale with red star
        #PS1="\${debian_chroot:+($debian_chroot)}${C_242}\u@\h:${C_246}\w ${C_31}🟊${C_RST} "
        # grayscale with red star, plus git branch status using U+2F40 KANGXI RADICAL BRANCH
        #PS1="\${debian_chroot:+($debian_chroot)}${C_242}\u@\h:${C_246}\w${B_97}\$(__git_ps1 ' (⽀%s)')${C_31} 🟊${C_RST} "
        # grayscale with red star, plus git branch status using U+2387 ALTERNATIVE KEY SYMBOL
        #PS1="\${debian_chroot:+($debian_chroot)}${C_242}\u@\h:${C_246}\w${B_97}\$(__git_ps1 ' (⎇ %s)')${C_31} 🟊${C_RST} "
        # grayscale with red star, plus git branch status using "herb" emoji
        PS1="\${debian_chroot:+($debian_chroot)}${C_242}\u@\h:${C_246}\w${B_97}\$(__git_ps1 ' (🌿%s)')${C_31} ★${C_RST} "
    else
        #PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
        PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$'
    fi
    unset color_prompt force_color_prompt

    # If this is an xterm set the title to user@host:dir
    case "$TERM" in
    xterm*|rxvt*)
        PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
        ;;
    *)
        ;;
    esac

    # Set up lines to wrap, by default, but also define functions to switch
    # back and forth
    function bashwrap()
    {
        tput smam
    }
    function bashnowrap()
    {
        tput rmam
    }
    bashwrap

    # A silly function to run when the terminal exits
    #function _exit()
    #{
    #        echo -e "${BRed}Hasta la vista, baby${NC}"
    #}
    #trap _exit EXIT

    # enable programmable completion features (you don't need to enable
    # this, if it's already enabled in /etc/bash.bashrc and /etc/profile
    # sources /etc/bash.bashrc).
    if ! shopt -oq posix; then
      if [ -f /usr/share/bash-completion/bash_completion ]; then
        . /usr/share/bash-completion/bash_completion
      elif [ -f /etc/bash_completion ]; then
        . /etc/bash_completion
      fi
    fi

    # enable color support of ls & add color-related aliases
    if [ -x /usr/bin/dircolors ]; then
        test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
        alias ls="ls -F --color=auto"
        alias la="ls -aF --color=auto"
        alias ll="ls -lhaF --color=auto --time-style=long-iso"
        alias grep='grep --color=auto'
        alias fgrep='fgrep --color=auto'
        alias egrep='egrep --color=auto'
    fi

    # Colors
    if [ -e /usr/share/terminfo/x/xterm-256color ]; then
        export TERM="xterm-256color"
    elif [ -e /usr/share/terminfo/x/xterm+256color ]; then
        export TERM="xterm-256color"
    else
        export TERM="xterm-color"
    fi

    # Set up 'file open' command for use in functions 
    opencommand="xdg-open"

    ######## Specific settings for Windows Subsystem for Linux (WSL2)
    # (add-on/changes to base Linux config)
    if [ $(grep -ic Microsoft /proc/version) -eq 1 ]; then

        # basic prompt
        #PS1="\${debian_chroot:+($debian_chroot)}${B_32}\u@\h$:${B_34}\w${C_RST}$ "
        # grayscale with Debian swirl (via 'cyclone' emoji)
        #PS1="${C_242}\u@\h:${C_246}\w${B_97} 🌀${C_RST} "
        # grayscale with basic "$", plus git branch status using "herb" emoji
        PS1="${C_242}\u@\h:${C_246}\w${B_97}\$(__git_ps1 ' (🌿%s)')\$${C_RST} "
        # grayscale with Debian swirl (via 'cyclone' emoji), plus git branch status using "herb" emoji
        #PS1="${C_242}\u@\h:${C_246}\w${B_97}\$(__git_ps1 ' (🌿%s)') 🌀${C_RST} "

        # X11 forwarding
        export DISPLAY=localhost:0.0

        # Windows "start" command (for opening files, the Explorer, websites, etc.)
        alias start="cmd.exe /c start"

        # Set up browser command for use in functions 
        opencommand="cmd.exe /c start"
    fi

;;
Haiku)

    ## Colors
    export TERM="xterm-256color"

    # Set up browser command for use in functions 
    opencommand="open"

;;
FreeBSD)

    # Prompt
    export PS1="${C_36}[\A]${B_32}\u@$machine:${B_34}\W${C_RST}$ "

    # Aliases
    alias ls='ls -pG'
    alias la='ls -paG'
    alias ll='ls -pohGa'

    # Colors
    export TERM='xterm-256color'
    LSCOLORS='ExGxxxxxCxxxxxxxxxxxxx'
    export LSCOLORS

    # Set up browser command for use in functions 
    opencommand="open"

;;
Darwin)

    # Prompt; #TODO revise
    # Hostname variant
    #export PS1="$txtcyn[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "
    # ComputerName variant
    #export PS1="$txtcyn[\A]$bldgrn\u@$machine:$bldblu\W$txtrst$ "
    #                           [time]    user@host:  working dir $
    #Rainbow variant
    #export PS1="$bldred"▯"$bldylw"▯"$bldgrn"▯"$bldcyn"▯"$bldblu"▯"$bldpur"▯"$bldblk \A $bldgrn\u@\h:$bldblu\W$txtrst$ "
    #Todo: use □ or ▯ instead?
    # Weird two-line prompt:
    #export PS1="┌─[ \[\e[1;32m\]\w\[\e[0m\] ]\n└─$ "

    # Colors
    export TERM='xterm-256color'
    export LSCOLORS='ExGxxxxxCxxxxxxxxxxxxx'

    # Aliases
    alias ls='ls -pG'
    alias la='ls -paG'
    alias ll='ls -pohGa'

    # Set up browser command for use in functions 
    browsercommand="open"

;;
*)
    echo "OS not detected by .bashrc";;
esac

######## Machine-specific additions
#source another external local file for local additions to .bashrc;
#this file is in the .gitignore
if [ -f $HOME/.bashrc_local ]; then
    . $HOME/.bashrc_local
fi
 
######## Custom functions

# commands for searching from command line
google() {
    search=""
    echo "Googling: $@"
    for term in $@; do
        search="$search%20$term"
    done
    $opencommand "http://www.google.com/search?q=$search"
    unset search
}
ddg() {
    search=""
    echo "Duck-Duck-Going: $@"
    for term in $@; do
        search="$search%20$term"
    done
    $opencommand "https://duckduckgo.com/?t=h_&q=$search"
    unset search
}
wiki() {
    search=""
    echo "Searching Wikipedia: $@"
    for term in $@; do
        search="$search%20$term"
    done
    $opencommand "http://en.wikipedia.org/w/index.php?search=$search"
    unset search
}

# not sure what this was for...
#function encode() { echo -n $@ | perl -pe's/([^-_.~A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg'; }

######## Cleanup

# Clean up variables for prompt colors
for var in $colorvars; do unset $var; done
unset colorvars

[ -f "/home/blair/.ghcup/env" ] && source "/home/blair/.ghcup/env" # ghcup-env
. "$HOME/.cargo/env"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
