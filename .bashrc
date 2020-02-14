#!/bin/bash

######## Universal Options #####################################################

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# Prompt:
txtblk='\[\033[0;30m\]' # Black - Regular
txtred='\[\033[0;31m\]' # Red
txtgrn='\[\033[0;32m\]' # Green
txtylw='\[\033[0;33m\]' # Yellow
txtblu='\[\033[0;34m\]' # Blue
txtpur='\[\033[0;35m\]' # Purple
txtcyn='\[\033[0;36m\]' # Cyan
txtwht='\[\033[0;37m\]' # White
bldblk='\[\033[1;30m\]' # Black - Bold
bldred='\[\033[1;31m\]' # Red
bldgrn='\[\033[1;32m\]' # Green
bldylw='\[\033[1;33m\]' # Yellow
bldblu='\[\033[1;34m\]' # Blue
bldpur='\[\033[1;35m\]' # Purple
bldcyn='\[\033[1;36m\]' # Cyan
bldwht='\[\033[1;37m\]' # White
unkblk='\[\033[4;30m\]' # Black - Underline
undred='\[\033[4;31m\]' # Red
undgrn='\[\033[4;32m\]' # Green
undylw='\[\033[4;33m\]' # Yellow
undblu='\[\033[4;34m\]' # Blue
undpur='\[\033[4;35m\]' # Purple
undcyn='\[\033[4;36m\]' # Cyan
undwht='\[\033[4;37m\]' # White
bakblk='\[\033[7;40m\]'   # Black - Background
bakred='\[\033[7;41m\]'   # Red
badgrn='\[\033[7;42m\]'   # Green
bakylw='\[\033[7;43m\]'   # Yellow
bakblu='\[\033[7;44m\]'   # Blue
bakpur='\[\033[7;45m\]'   # Purple
bakcyn='\[\033[7;46m\]'   # Cyan
bakwht='\[\033[7;47m\]'   # White
txtrst='\[\033[0m\]'    # Text Reset

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
#shopt -s globstar

# Make SVN use vim as the default editor
export SVN_EDITOR=vim

# Machine shortcuts

## Home machines
solaria="Dave@solaria.53964783.members.btmm.icloud.com"
arrakis="Dave@arrakis.53964783.members.btmm.icloud.com"

## Brown machines
orch="dblair@outreach-test.geo.brown.edu"
casey="rialb1091@casey.brown.edu"
geops="dblair@geops.geo.brown.edu"
ted="dblair@ted.hetchem.brown.edu"
daniel="dblair@daniel.geo.brown.edu"
numbers="dblair@numbers.geo.brown.edu"
samuel="dblair@samuel.geo.brown.edu"
sarah="dblair@sarah.geo.brown.edu"
gansett="-oHostKeyAlgorithms=+ssh-dss dblair@gansett.eci.brown.edu"
tycho="dblair@tycho.geo.brown.edu"
moho="Administrator@gc114-moho.geo.brown.edu"
gutenberg="Admin@gc114-gutenberg.geo.brown.edu"

## Old work machines
cirrus="dblair@cirrus.haystack.mit.edu"
taylor="dblair@taylor.eaps.purdue.edu"
chilmark="dblair@chilmark.eaps.purdue.edu"
dogfish="dblair@dogfish.eaps.purdue.edu"
vineyard="dblair@vineyard.eaps.purdue.edu"
maven="dblair@maven.itap.purdue.edu"

# Silly stuff
alias untar='echo "I AM UNTAR, LORD OF THE UNIVERSE!"'
alias y="echo I\'m sorry Dave, I can\'t do that."
alias :w="echo You\'re not in VIM, dammit!"
alias :wq="echo You\'re not in VIM, dammit!"
alias :q="echo You\'re not in VIM, dammit!"

######## OS-Specific Settings ##################################################

######## Linux #################################################################
if [ $(uname) == "Linux" ]; then

    # Get machine name for machine-specific stuff later
    machine=$(hostname)

    # Prompt
    #set_title='\[\033]0;\w - Terminal\007\]'
    #export PS1=$set_title"$bldblk[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "
    #export PS1="$bldblk[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "
    export PS1="$bldwht[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "
    #                           [time]    user@host:  working dir $

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

    # Paths (universal)
    export PATH="/home/dblair/local/bin:$PATH"

    # Aliases
    alias ls="ls -F --color"
    alias la="ls -Fa --color"
    alias ll="ls -Ftoh --color --time-style=long-iso"

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

######## Other unsupported OSes ################################################
else
    echo "OS not found in .bashrc"
fi


######## Custom Functions ######################################################

# Commands for searching from command line
function encode() { echo -n $@ | perl -pe's/([^-_.~A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg'; }
function google() { $browsercommand http://www.google.com/search?hl=en#q="`encode $@`" ;}
function yahoo() { $browsercommand http://search.yahoo.com/search?p="`encode $@`" ;}
function bing() { $browsercommand http://www.bing.com/search?q="`encode $@`" ;}
function amazon() { $browsercommand http://www.amazon.com/s/ref=nb_ss?field-keywords="`encode $@`" ;}
function wiki() { $browsercommand http://en.wikipedia.org/w/index.php?search="`encode $@`" ;}


######## Machine-Specific Settings #############################################

######## Arrakis ###############################################################
if [ "$machine" == "Arrakis" ]; then

    # Terminal
    ## Paths
    export PATH=""
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/usr/local/share/python"
    export PATH="$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin"
    export PATH="$PATH:/Users/Dave/Code/bin:/Users/Dave/Code/lib:/Users/Dave/Code/bin-3rdparty"
    export PATH="$PATH:/Users/Dave/Dropbox/Code"
    export PATH="$PATH:/usr/local/texlive/2012/bin/x86_64-darwin/"
    export PATH="$PATH:/Library/Frameworks/GDAL.framework/Versions/1.9/Programs"
    export PATH="$PATH:."
    export PYTHONPATH="$PYTHONPATH:/Users/Dave/Code/lib"

    # Aliases
    alias postgresup='pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start'
    alias postgresdown='pg_ctl -D /usr/local/var/postgres stop -s -m fast'

    # ISIS
    export ISISROOT="/Applications/isis3/isis"
    export ISIS3DATA="/Applications/isis3/data"
    export ISIS3TESTDATA="/Applications/isis3/testData"
    export PATH="$PATH:/Applications/isis3/isis/bin"

    # Compiler flags
    export ARCHFLAGS="-arch x86_64"

    # Start Python with a script full of automatic imports, fixes, whatever
    alias py='python -i $code/bin/python_init.py'


######## Solaria ###############################################################
elif [ "$machine" == "Solaria" ]; then

    # Terminal
    ## Paths
    export PATH="$PATH:/bin"
    export PATH="$PATH:/usr/bin"
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/Users/Dave/Code"
    export PATH="$PATH:~/Code/bin"
    export PATH="$PATH:~/Code/local_solaria/bin"

    # Compiler flags
    export ARCHFLAGS="-arch x86_64"

    # Start Python with a script full of automatic imports, fixes, whatever
    alias py='python -i $code/bin/python_init.py'

######## Other Machines ########################################################
#else
#    echo "Machine not recognized in .bashrc"

fi


