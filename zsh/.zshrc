#!/bin/zsh
#ZSH settings file, run for 

# path settings
# discard duplicates from PATH and path
typeset -U PATH path
# prepent to path, then export it
path=("$HOME/local" $path)
path=('.' $path)
export PATH

# prompt settings
#export PS1="%n@%m %1~ %#"
#export PS1="%F{238}%n@%m %F{244}%~ %F{cyan}%# %F{256}"
export PS1="%F{238}%n@%m %F{244}%~ %F{cyan}%# %F{256}"

# universal alaises to prevent stupid mistakes
alias cp='cp -i'
alias mv='mv -i'
alias rm='rm -i'

# other aliases
alias ls="ls -GF"
alias ll="ls -lGF"
alias la="ls -aGF"

# activate Homebrew
eval "$(/usr/local/bin/brew shellenv)"
