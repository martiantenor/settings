# settings
Settings files for various computers, although mostly \*nix systems.

## Usage
1. Clone this repo into a non-system directory on the target machine, e.g. `git clone git@github.com:martiantenor/settings.git ~/.dotfiles`
2. Create symbolic links as needed. Some examples:
    - for ZSH, `ln -s ~/.dotfiles/zsh/.zshenv ~/` (this file sets ZDOTDIR to `~/.dotfiles/zsh`, where the rest of the ZSH config is saved)
    - for VIM settings, `ln -s ~/.dotfiles/.vim ~/`
    - for Neovim settings, `ln -s ~/.dotfiles/.config ~/`
