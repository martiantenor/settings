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
casey="rialb1091@casey.brown.edu"
geops="dblair@geops.geo.brown.edu"
ted="dblair@ted.hetchem.brown.edu"
daniel="dblair@daniel.geo.brown.edu"
numbers="dblair@numbers.geo.brown.edu"
samuel="dblair@samuel.geo.brown.edu"
sarah="dblair@sarah.geo.brown.edu"

## Old work machines
cirrus="dblair@cirrus.haystack.mit.edu"
taylor="dblair@taylor.eaps.purdue.edu"
chilmark="dblair@chilmark.eaps.purdue.edu"
dogfish="dblair@dogfish.eaps.purdue.edu"
vineyard="dblair@vineyard.eaps.purdue.edu"
maven="dblair@maven.itap.purdue.edu"

## Specific folders on other machines
lava_vineyard="$vineyard:/project/vineyard/a/dave/lavatubes"

# Silly stuff
alias untar='echo "I AM UNTAR, LORD OF THE UNIVERSE!"'
alias y="echo I\'m sorry Dave, I can\'t do that."
alias :w="echo You\'re not in VIM, dammit!"
alias :wq="echo You\'re not in VIM, dammit!"
alias :q="echo You\'re not in VIM, dammit!"

######## OS-Specific Settings ##################################################

######## macOS (Mac OS X) ######################################################
if [ $(uname) == "Darwin" ]; then

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
    browsercommand="open -a Safari"

######## Linux #################################################################
elif [ $(uname) == "Linux" ]; then

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

    # Some things from the default .bashrc
    ##
    ##
    ##

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
    browsercommand="firefox"

######## Windows Subsystem for Linux / Bash on Ubuntu on Windows ###############
    if grep -q Microsoft /proc/version; then
        
        # X11 forwarding
        export DISPLAY=localhost:0.0
    fi


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

    # Other
    browsercommand="midori"

######## Windows+Cygwin ########################################################
elif [ $(uname) == "CYGWIN_NT-10.0" ]; then

    # Prompt
    echo "Running from Cygwin"
    export PS1="$bldwht[\A]$bldgrn\u@\h:$bldblu\W$txtrst$ "

    # Colors
    if [ -e /usr/share/terminfo/x/xterm-256color ]; then
        export TERM="xterm-256color"
    else
        export TERM="xterm-color"
    fi

######## haiku #################################################################
elif [ $(uname) == "Haiku" ]; then

    ## Colors
    export TERM="xterm-256color"
    #if [ -e /usr/share/terminfo/x/xterm-256color ]; then
    #    export TERM="xterm-256color"
    #else
    #    export TERM="xterm-color"
    #fi

    browsercommand="WebPositive"

######## Other unsupported OSes ################################################
else
    echo "OS not found in .bashrc"
fi

# Commands for searching from command line
function encode() { echo -n $@ | perl -pe's/([^-_.~A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg'; }
function google() { $browsercommand http://www.google.com/search?hl=en#q="`encode $@`" ;}
function yahoo() { $browsercommand http://search.yahoo.com/search?p="`encode $@`" ;}
function bing() { $browsercommand http://www.bing.com/search?q="`encode $@`" ;}
function amazon() { $browsercommand http://www.amazon.com/s/ref=nb_ss?field-keywords="`encode $@`" ;}
function wiki() { $browsercommand http://en.wikipedia.org/w/index.php?search="`encode $@`" ;}


######## Machine-Specific Settings #############################################


######## gc166-alderaan & gc166-elrond #########################################
if [ "$machine" == "gc166-alderaan" ]; then

    # Terminal
    export PATH=""
    export PATH="$PATH:/Users/dblair/.code/bin"
    export PATH="$PATH:/usr/local/bin:/opt/X11/bin"
    export PATH="$PATH:/usr/bin:/bin:/usr/sbin:/sbin"

    # Aliases
    alias sbcl="rlwrap sbcl"


elif [ "$machine" == "elrond" ]; then

    # Terminal
    export PATH="/usr/local/miniconda2/bin:$PATH"


######## vm_asag ################################################################
elif [ "$machine" == "vm_asag" ]; then

    ## Test
    echo "BSD 4EVA!!"


######## Arrakis ###############################################################
elif [ "$machine" == "Arrakis" ]; then

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


######## Taylor ################################################################
elif [ "$machine" == "taylor.eaps.purdue.edu" ]; then

    # Terminal
    ## Fix delete key
    if tty --quiet; then
        stty erase '^?'
    fi
    ## Paths
    ### My own directories
    export PATH="."
    export PATH="$PATH:/project/taylor/a/dave/local/bin/"
    export PATH="$PATH:/project/taylor/a/dave/code/bin"
    export PATH="$PATH:/project/taylor/a/dave/code/lib"
    export PATH="$PATH:/project/taylor/a/dave/local/bin"
    export PATH="$PATH:/project/taylor/a/dave/local/lib"
    #export PATH="$PATH:/project/taylor/a/dave/local/include"
    #export PATH="$PATH:/project/taylor/a/dave/local/include/python2.7"
    ### Machine-level
    export PATH="$PATH:/bin:/sbin:/usr/bin:/usr/sbin:"
    export PATH="$PATH:/usr/kerberos/bin"
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/usr/X11R6/bin"
    export PATH="$PATH:/opt/pgi/linux86-64/8.0-6/bin"
    export PATH="$PATH:/opt/idl/idl/bin"
    export PATH="$PATH:/usr/site/eas/bin"
    export PATH="$PATH:/lib:/lib64:/usr/lib:/usr/lib64"
    export PATH="$PATH:/opt/intel/Compiler/11.1/073/bin/intel64/"
    export PATH="$PATH:/project/taylor/a/dave/local/cmake-2.8.12.1-Linux-i386/bin"
    export PATH="$PATH:/project/taylor/a/abaqus/Commands/"
    ### Python
    export PYTHONPATH="$PYTHONPATH:/project/taylor/a/dave/code/lib:/project/taylor/a/dave/code/bin"
    export PYTHONPATH="$PYTHONPATH:/project/taylor/a/dave/local/lib"
    export PYTHONPATH="$PYTHONPATH:/project/taylor/a/dave/local/lib64/python2.4/site-packages/"
    export PYTHONPATH="$PYTHONPATH:/home/campus/dblair/.local/lib/python2.6/site-packages/"
    #export PYTHONPATH="$PYTHONPATH:/export/project/a/abaqus/6.12-2/tools/SMApy/lib/python2.6/site-packages"
    ### LaTeX
    #export TEXINPUTS=".:/project/taylor/a/dave/lib/latex//:"
    #export TEXINPUTS="$TEXINPUTS:/project/taylor/a/dave/local/latex//:"
    ### Compiling
    export INCLUDE_PATH="/project/taylor/a/dave/local/include/python2.7"
    export C_INCLUDE_PATH="/project/taylor/a/dave/local/include/python2.7"
    #export LDFLAGS="-L/project/taylor/a/dave/local/lib"
    #export CFLAGS="-l/project/taylor/a/dave/local/include"
    export CFLAGS="-I/project/taylor/a/dave/local/include/python2.7"
    export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/project/taylor/a/dave/local/lib"

    ## Aliases
    alias naut='nautilus --no-desktop --browser'
    alias open='gnome-open'
    alias ack='ack-standalone'
    #alias abaqus='/project/taylor/a/abaqus/Commands/abaqus' #now in PATH
    alias abq='/project/taylor/a/dave/code/run_abaqus.sh'
    alias isympy='pushd /project/taylor/a/dave/local/sympy-0.6.5/; bin/isympy; popd'
    alias ps='ps xfc'
    #alias 7za='$code/p7zip/bin/7za'
    alias getip="/sbin/ifconfig | grep 'inet addr' | grep -v 127.0.0.1 | awk '{print \$2}' | sed 's/addr://g'"
    alias matlab='/opt/matlab/bin/matlab'
    alias matlabcli='matlab -nodesktop -nosplash'
    alias blender='cd /project/taylor/a/dave/local/blender*; ./blender'
    #alias remove_useless='rm *.{com,dat,ipm,log,msg,sim}'
    alias mysql_login='mysql -h mydb.itap.purdue.edu -p'

    # Shortcuts
    dave="/project/taylor/a/dave"
    code="$dave/code"
    db="$dave/Dropbox"
    notes="$db/Notes"
    statusmeeting="$db/Group*Meeting*Status*Meetings"
    masconsandy="/project/dogfish/a/mascon"
    ori="$dave/orientale"
    oridb="$db/Project*-*Orientale"
    lava="$dave/lavatubes"
    lavadb="$db/Project*Lava*"
    cal="$dave/caloris"
    caldb="$db/Project*-*Caloris"
    end="3.156e13" #for abqplot use, mainly
    lt="$dave/lavatubes"
    ltdb="$db/Project*-*Lava*Tubes"
    diss="$db/Project*-*Dissertation"

    # Start Python with a script full of automatic imports, fixes, whatever
    alias py='python -i $code/bin/python_init.py'

    # Other
    ## Load up ifort & Linux Kernel Math Library
    source /opt/intel/Compiler/11.1/056/bin/intel64/ifortvars_intel64.sh
    source /opt/intel/mkl/bin/intel64/mklvars_intel64.sh
    #source /opt/intel/cmkl/10.2.6.038/tools/environment/mklvars64.sh
    ## For monitoring abaqus jobs:
    export LM_LICENSE_FILE="1736@mooring.ecn.purdue.edu"
    alias abstat="/project/taylor/a/abaqus/6.11-1/External/flexlm/lmstat -a"
    alias abstatme="/project/taylor/a/abaqus/6.11-1/External/flexlm/lmstat -a | grep dblair"
    ## For Citrix (Purdue software remote)
    export ICAROOT="/project/taylor/a/dave/ICAClient/linuxx86"


######## Chilmark ##############################################################
elif [ "$machine" == "chilmark.eaps.purdue.edu" ]; then

    # Terminal
    ### Fix delete key:
    #if tty --quiet; then
    #    stty erase '^?'
    #fi
    ## Paths
    ### Machine-level
    export PATH="/bin"
    export PATH="$PATH:/usr/kerberos/bin"
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/usr/bin"
    export PATH="$PATH:/usr/lib:/usr/lib64"
    export PATH="$PATH:/usr/X11R6/bin"
    export PATH="$PATH:/opt/pgi/linux86-64/8.0-6/bin"
    export PATH="$PATH:/opt/idl/idl/bin"
    export PATH="$PATH:/usr/site/eas/bin"
    export PATH="$PATH:/opt/intel/Compiler/11.1/073/bin/intel64/"
    export PATH="$PATH:/opt/gempak/extlibs/zlib/"
    export PATH="$PATH:/opt/gempak/os/linux/include"
    export PATH="$PATH:/usr/src/kernels/2.6.18-164.el5-x86_64/include/linux/"
    export PATH="$PATH:/usr/src/kernels/2.6.18-274.7.1.el5-x86_64/include/linux/"
    ### My own directories
    export PATH="$PATH:/project/chilmark/a/dave/local/bin/"
    ### Python
    #export PYTHONPATH="/project/chilmark/a/dave/local/lib/lib64/python2.4/site-packages/"
    #export PYTHONPATH="$PYTHONPATH:/project/chilmark/a/dave/local/lib:/project/chilmark/a/dave/local"
    export PYTHONSTARTUP="/home/lookout/m3/dblair/.pythonstartup"

    ## Aliases
    alias naut='nautilus --no-desktop --browser'
    alias open='gnome-open'
    alias abaqus='/project/chilmark/a/abaqus/Commands/abaqus'

    # Shortcuts
    dave="/project/chilmark/a/dave"
    dave_taylor="/project/taylor/a/dave"
    db="$dave_taylor/Dropbox"
    notes="$db/Notes"

    # Other
    ## For monitoring abaqus jobs:
    export LM_LICENSE_FILE="1736@mooring.ecn.purdue.edu"
    alias abstat="/project/taylor/a/abaqus/6.11-1/External/flexlm/lmstat -a"
    alias abstatme="/project/taylor/a/abaqus/6.11-1/External/flexlm/lmstat -a | grep dblair"


######## Vineyard ##############################################################
elif [ "$machine" == "vineyard.eaps.purdue.edu" ]; then

    # Terminal
    ### Fix delete key:
    #if tty --quiet; then
    #    stty erase '^?'
    #fi
    ## Paths
    ### Machine-level
    export PATH="/bin"
    export PATH="$PATH:/usr/kerberos/bin"
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/usr/bin"
    export PATH="$PATH:/usr/lib:/usr/lib64"
    export PATH="$PATH:/usr/X11R6/bin"
    export PATH="$PATH:/opt/pgi/linux86-64/8.0-6/bin"
    export PATH="$PATH:/opt/idl/idl/bin"
    export PATH="$PATH:/usr/site/eas/bin"
    export PATH="$PATH:/opt/intel/Compiler/11.1/073/bin/intel64/"
    export PATH="$PATH:/opt/gempak/extlibs/zlib/"
    export PATH="$PATH:/opt/gempak/os/linux/include"
    export PATH="$PATH:/usr/src/kernels/2.6.18-164.el5-x86_64/include/linux/"
    export PATH="$PATH:/usr/src/kernels/2.6.18-274.7.1.el5-x86_64/include/linux/"
    ### My own directories
    #export PATH="$PATH:/project/vineyard/a/dave/local/bin/"
    ### Python
    #export PYTHONPATH="/project/chilmark/a/dave/local/lib/lib64/python2.4/site-packages/"
    #export PYTHONPATH="$PYTHONPATH:/project/chilmark/a/dave/local/lib:/project/chilmark/a/dave/local"
    #export PYTHONSTARTUP="/home/lookout/m3/dblair/.pythonstartup"

    ## Aliases
    alias naut='nautilus --no-desktop --browser'
    alias open='gnome-open'
    alias abaqus='/export/project/a/Abaqus/Commands/abaqus'
    alias abq='/project/vineyard/a/dave/code/run_abaqus.sh'

    # Shortcuts
    dave_vineyard="/project/vineyard/a/dave"
    dave_taylor="/project/taylor/a/dave"
    db="$dave_taylor/Dropbox"
    notes="$db/Notes"

    # Other
    ## For monitoring abaqus jobs:
    export LM_LICENSE_FILE="1736@mooring.ecn.purdue.edu"
    alias abstat="/export/project/a/Abaqus/Commands/abaqus licensing lmstat -a"


######## Virtualbox Linux Boxen ##################################################
elif [ "$machine" == "gandalf" -o "$machine" == "bombadil" ]; then

    # Terminal
    ### Fix delete key:
    #if tty --quiet; then
    #    stty erase '^?'
    #fi
    ## Paths
    ### Machine-level
    export PATH="/bin"
    export PATH="$PATH:/usr/local/bin"
    export PATH="$PATH:/usr/bin"
    export PATH="$PATH:/usr/lib:/usr/lib64"
    export PATH="$PATH:/usr/X11R6/bin"
    export PATH="$PATH:/usr/lib/gmt/bin"
    ### My own directories
    export PATH="$PATH:/home/dave/Dropbox/Code/bin"
    ### Python

    ## Ensure editor is gvim instead of some other junk
    export EDITOR=gvim

    # Shortcuts
    db="/home/dave/Dropbox"
    diss="$db/Project*-*Dissertation/Dissertation"
    notes="$db/Notes"


######## dogfish.eaps.purdue.edu ################################################
elif [ "$machine" == "dogfish.eaps.purdue.edu" ]; then

    ## Aliases
    alias ls="ls -F --color"
    alias la="ls -Fa --color"
    alias ll="ls -Ftoh --color --time-style=long-iso"
    alias naut='nautilus --no-desktop --browser'
    alias open='gnome-open'

    ## Paths
    export PATH="$PATH:$HOME/local/bin"


######## Other Machines ########################################################
#else
#    echo "Machine not recognized in .bashrc"

fi
