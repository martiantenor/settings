"Set working Directory
"cd /Users/dblair/Documents

" Window setup
set columns=90
set lines=60

" Colors
"colorscheme wombat
"set transparency=0
" Solarized
set background=light
colorscheme solarized

" Fonts

""Windows check
if has('win32') || has('win64')
    set guifont=Consolas:h10
    set guifontwide=M+\ 2m:h10
else

    "" Bitmap fonts
    "set noantialias "regular only 
    "set guifont=ProFontIIx:h12 "regular only
    "set guifont=Dina\ ttf\ 10px:h16 "regular only
    "set guifont=ProggyCleanTT:h15 "regular only
    "set guifont=Terminus:h16 "bold
    "set guifont=GohuFont:h14 "bold
    "set guifont=Anonymous\ Pro:h12 "bold, serifs
    "set guifont=Envy\ Code\ R:h13 "italics

    " Small bitmapped font choices
    "set guifont=GohuFont:h11 "bold
    "set guifont=ProFontIIx:h9 "regular only
    "set guifont=ProggySquareTT:h15 "regular only

    "" Non-bitmapped font choices
    set antialias
    set guifont=Anonymous\ Pro:h12
    "set guifont=Sudo:h16
    "set guifont=Monaco:h10
endif

" Scroll bars
set guioptions+=LlRrb
set guioptions-=LlRrb
"set guioptions-=T

" Fullscreen options
"set fuoptions=maxvert,maxhorz
"set fuoptions=maxvert

