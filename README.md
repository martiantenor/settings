# settings
Settings files for various computers, although mostly \*nix systems.

## Usage
1. Clone this repo into a non-system directory on the target machine, e.g. `git clone git@github.com:martiantenor/settings.git ~/.dotfiles`
2. Create symbolic links as needed, e.g. `ln -s ~/.dotfiles/.vim ~/.`, or all at once with `cd; ln -s ~/.dotfiles/.* ~/.`
    - For ZSH setup, just symlink the `.zshenv` file to your home directory with `ln -s ~/.dotfiles/zsh/.zshenv ~/`
