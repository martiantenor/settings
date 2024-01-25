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

# silly stuff
alias untar='echo "I AM UNTAR, LORD OF THE UNIVERSE!"'
alias y="echo I\'m sorry Dave, I can\'t do that."
alias :w="echo You\'re not in VIM, dammit!"
alias :wq="echo You\'re not in VIM, dammit!"
alias :q="echo You\'re not in VIM, dammit!"
 
 
######## Custom functions

# commands for searching from command line
function google() { $browsercommand http://www.google.com/search?hl=en#q="`encode $@`" ;}
function ddg() { $browsercommand https://duckduckgo.com/?t=h_&q="`encode $@`" ;}
function wiki() { $browsercommand http://en.wikipedia.org/w/index.php?search="`encode $@`" ;}

# not sure what this was for...
#function encode() { echo -n $@ | perl -pe's/([^-_.~A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg'; }


######## OS-specific settings: Linux
if [ $(uname) == "Linux" ]; then

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

    if [ "$color_prompt" = yes ]; then
        #PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
        PS1='${debian_chroot:+($debian_chroot)}\[\033[01;90m\]\u@\h:\[\033[01;37m\]\w\[\033[00;31m\] 🟊\[\033[00m\] '
    else
        #PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
        PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w 🟊'
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
        alias la="ls -FA --color=auto"
        alias ll="ls -Ftoh --color=auto --time-style=long-iso"
        alias lla="ls -FtohA --color=auto --time-style=long-iso"
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

    # Set up browser command for use in functions 
    browsercommand="firefox"

######## OS-specific settings: Haiku
elif [ $(uname) == "Haiku" ]; then

    ## Colors
    export TERM="xterm-256color"

    # Set up browser command for use in functions 
    browsercommand="WebPositive"

######## OS-specific settings: FreeBSD
elif [ $(uname) == "FreeBSD" ]; then

    # Prompt
    export PS1="$txtcyn[\A]$bldgrn\u@$machine:$bldblu\W$txtrst$ "

    # Aliases
    alias ls='ls -pG'
    alias la='ls -paG'
    alias ll='ls -pohGa'

    # Colors
    export TERM='xterm-256color'
    LSCOLORS='ExGxxxxxCxxxxxxxxxxxxx'
    export LSCOLORS

    # Set up browser command for use in functions 
    browsercommand="midori"

######## OS-specific settings: macOS / Mac OS X
elif [ $(uname) == "Darwin" ]; then

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
    browsercommand="open -a Safari"


######## OS-specific settings: Windows Subsystem for Linux
elif grep -q Microsoft /proc/version; then

    # X11 forwarding
    export DISPLAY=localhost:0.0

    # Windows "start" command (for opening files, the Explorer, websites, etc.)
    alias start="cmd.exe /c start"

    # Set up browser command for use in functions 
    browsercommand="cmd.exe /c start"

######## OS-specific settings: OS not detected
else
    echo "OS not detected by .bashrc"
fi

######## Machine-specific additions
#source another external local file for local additions to .bashrc;
#this file is in the .gitignore
if [ -f $HOME/.bashrc_local ]; then
    . $HOME/.bashrc_local
fi
