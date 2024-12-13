" NVim settings file
"
"
" From [https://vi.stackexchange.com/questions/12794/how-to-share-config-between-vim-and-neovim]()
set runtimepath^=~/.vim runtimepath+=~/.vim/after
let &packpath=&runtimepath
source ~/.vim/vimrc

call plug#begin()
Plug 'scrooloose/nerdtree'

"Colorschemes
Plug 'ellisonleao/gruvbox.nvim'
Plug 'dracula/vim'
"Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'jaredgorski/spacecamp'
Plug 'jacoborus/tender.vim'
Plug 'cormacrelf/vim-colors-github'

"Lilypond
Plug 'martineausimon/nvim-lilypond-suite'
call plug#end()


colo dracula

highlight Normal guibg=#0E1117
"call BGtrans()
