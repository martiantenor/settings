# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

######## Universal Options #####################################################

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# Make sure we're always using UTF8
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

# VIM-mode in the prompt (vs. Emacs mode)
#set -o vi

# Set nano as the default editor (since I can always call "vim" by name)
export EDITOR=nano

## Recreates the handy-dandy <C-l> for "clear"
bind -m vi-insert "\C-l":clear-screen

# Universal alaises to prevent stupid mistakes
alias cp='cp -i'
alias mv='mv -i'
alias rm='rm -i'

# don't put duplicate lines or lines starting with space in the history.
# See bash(1) for more options
HISTCONTROL=ignoreboth

# Save more lines of history than normal
HISTSIZE=1000
HISTFILESIZE=2000

# Append to history instead of overwriting it
shopt -s histappend

# check the window size after each command and, if necessary,
# update the values of LINES and COLUMNS.
shopt -s checkwinsize

# If set, the pattern "**" used in a pathname expansion context will
# match all files and zero or more directories and subdirectories.
shopt -s globstar

# Make SVN use vim as the default editor
export SVN_EDITOR=vim

# make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

# Silly stuff
alias untar='echo "I AM UNTAR, LORD OF THE UNIVERSE!"'
alias y="echo I\'m sorry Dave, I can\'t do that."
alias :w="echo You\'re not in VIM, dammit!"
alias :wq="echo You\'re not in VIM, dammit!"
alias :q="echo You\'re not in VIM, dammit!"
 
 
 
######## Custom Functions ######################################################

# Commands for searching from command line
function encode() { echo -n $@ | perl -pe's/([^-_.~A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg'; }
function google() { $browsercommand http://www.google.com/search?hl=en#q="`encode $@`" ;}
function bing() { $browsercommand http://www.bing.com/search?q="`encode $@`" ;}
function amazon() { $browsercommand http://www.amazon.com/s/ref=nb_ss?field-keywords="`encode $@`" ;}
function wiki() { $browsercommand http://en.wikipedia.org/w/index.php?search="`encode $@`" ;}


######## OS-Specific Settings ##################################################

######## Linux #################################################################
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
        #PS1='${debian_chroot:+($debian_chroot)}\[\033[01;90m\]\u@\h\[\033[00m\]:\[\033[01;37m\]\w\[\033[00;31m\] 🟊\[\033[00m\] '
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
    # Paths (universal)
    export PATH="/home/dave/local/bin:$PATH:/usr/local/sbin:/usr/sbin"

    # enable color support of ls and also add handy aliases
    if [ -x /usr/bin/dircolors ]; then
        test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
        alias ls='ls --color=auto'
        #alias dir='dir --color=auto'
        #alias vdir='vdir --color=auto'
    
        alias grep='grep --color=auto'
        alias fgrep='fgrep --color=auto'
        alias egrep='egrep --color=auto'
    fi

    # Aliases
    alias ls="ls -F --color=auto"
    alias la="ls -FA --color=auto"
    alias ll="ls -Ftoh --color=auto --time-style=long-iso"
    alias lla="ls -FtohA --color=auto --time-style=long-iso"

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

######## haiku #################################################################
elif [ $(uname) == "Haiku" ]; then

    ## Colors
    export TERM="xterm-256color"
    #if [ -e /usr/share/terminfo/x/xterm-256color ]; then
    #    export TERM="xterm-256color"
    #else
    #    export TERM="xterm-color"
    #fi

    # Set up browser command for use in functions 
    browsercommand="WebPositive"


######## Windows Subsystem for Linux / Bash on Ubuntu on Windows ###############
    if grep -q Microsoft /proc/version; then

        # X11 forwarding
        export DISPLAY=localhost:0.0

        # Miniconda3
# export PATH="/home/dblair/local/miniconda3/bin:$PATH"  # commented out by conda initialize

        # Windows "start" command (for opening files, the Explorer, websites, etc.)
        alias start="cmd.exe /c start"

        # Set up browser command for use in functions 
        browsercommand="cmd.exe /c start"

        # Conda setup
        # >>> conda initialize >>>
        # !! Contents within this block are managed by 'conda init' !!
        __conda_setup="$('/home/dblair/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
        if [ $? -eq 0 ]; then
            eval "$__conda_setup"
        else
            if [ -f "/home/dblair/miniconda3/etc/profile.d/conda.sh" ]; then
                . "/home/dblair/miniconda3/etc/profile.d/conda.sh"
            else
                export PATH="/home/dblair/miniconda3/bin:$PATH"
            fi
        fi
        unset __conda_setup
        # <<< conda initialize <<<
        conda activate dev
    fi

######## macOS (Mac OS X) ######################################################
elif [ $(uname) == "Darwin" ]; then

    # Get machine name for machine-specific stuff later
    machine=$(scutil --get ComputerName)

    # Prompt
    # Hostname variant
    #export PS1="$txtcyn[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "
    # ComputerName variant
    export PS1="$txtcyn[\A]$bldgrn\u@$machine:$bldblu\W$txtrst$ "
    #                           [time]    user@host:  working dir $
    #Rainbow variant
    #export PS1="$bldred"▯"$bldylw"▯"$bldgrn"▯"$bldcyn"▯"$bldblu"▯"$bldpur"▯"$bldblk \A $bldgrn\u@\h:$bldblu\W$txtrst$ "
    #Todo: use □ or ▯ instead?

    # Weird two-line prompt:
    #export PS1="┌─[ \[\e[1;32m\]\w\[\e[0m\] ]\n└─$ "

    # Aliases
    alias ls='ls -pG'
    alias la='ls -paG'
    alias ll='ls -pohGa'

    # Colors
    export TERM='xterm-256color'
    LSCOLORS='ExGxxxxxCxxxxxxxxxxxxx'
    export LSCOLORS

    # Set up browser command for use in functions 
    browsercommand="open -a Safari"


######## FreeBSD ###############################################################
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

######## Other unsupported OSes ################################################
else
    echo "OS not found in .bashrc"
fi



######## Machine-Specific Settings #############################################

######## rorybory ##############################################################
if [ "$machine" == "rorybory" ]; then
    echo /dev/null > /dev/null
fi
