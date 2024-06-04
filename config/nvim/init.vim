" NVim settings file
"
"
" From [https://vi.stackexchange.com/questions/12794/how-to-share-config-between-vim-and-neovim]()
set runtimepath^=~/.vim runtimepath+=~/.vim/after
let &packpath=&runtimepath
source ~/.vim/vimrc

colo ir_black
call BGtrans()
