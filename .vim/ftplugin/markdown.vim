"Settings for *.txt files
"SoftPencil
"let g:markdown_folding = 1
set scrolloff=0

"line wrapping
set wrap
set linebreak
set breakindent
set breakindentopt=shift:2

"tab settings for Markdown
set expandtab
set tabstop=4
set softtabstop=4
set shiftwidth=4
set smartindent
set smarttab

"swap j/gj and k/gk cursor moves so that you can move
"between _displayed_ lines in a single keystroke, e.g.
"when lines are wrapped
nnoremap j gj
nnoremap gj j
nnoremap k gk
nnoremap gk k
