" NVim settings file
"
"
" From [https://vi.stackexchange.com/questions/12794/how-to-share-config-between-vim-and-neovim]()
set runtimepath^=~/.vim runtimepath+=~/.vim/after
let &packpath=&runtimepath
source ~/.vim/vimrc

call plug#begin()
Plug 'ellisonleao/gruvbox.nvim'
Plug 'dracula/vim'
"Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'scrooloose/nerdtree'
call plug#end()

colo dracula
call BGtrans()
