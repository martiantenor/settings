"VIM Configuration File

"Basic Settings
set mouse=a         "allows use of the mouse!
set noerrorbells    "don't make any damn noise!
set backspace=2     "makes it so backspace can edit old text
set backspace=indent,eol,start  "make baskspace more flexible
set nocompatible    "turn off wonky vi-style behavior
set nofoldenable    "turn off folding

set nomodeline

set enc=utf-8

"OS detection
if !exists("g:os")
    if has("win64") || has("win32") || has("win16")
        let g:os = "Windows"
    else
        let g:os = substitute(system('uname'), '\n', '', '')
    endif
endif

"If on a Mac or Linux, load Vundle plugins
if g:os == "Darwin" || g:os == "Linux"
    ""Vundle settings
    set nocompatible                "required, done earlier too
    filetype off                    "required
    set rtp+=~/.vim/bundle/Vundle.vim "runtime path
    call vundle#begin()             "required, can also have path specified
    Plugin 'VundleVim/Vundle.vim'   "required
    Plugin 'vim-pandoc/vim-pandoc-syntax'
    Plugin 'reedes/vim-pencil'
    "Plugin 'jdonaldson/vaxe'        "for Haxe, and HaxeFlixel
    call vundle#end()               "required after all plugins loaded
    filetype plugin indent on       "required
endif

" If on Linux or Mac, do line break stuff
if g:os == "Darwin"  || g:os == "Linux"

    "Line break/wrapping settings
    if v:version >= 704
        set breakindent
        set breakindentopt=shift:2
        set lbr
    endif
endif

"Fix the delete key, if on an OS X host (including MacVim)
"if has("unix")
"    let s:uname = system("uname")
"    if s:uname == "Darwin\n"
"        fixdel              "Fixes delete (for me)
"    endif
"endif

"Fix delete key in OS X and BSD
if g:os == "Darwin" || g:os == "FreeBSD"
    fixdel
endif

" If in Haiku, change runtimepath
if g:os == "Haiku"
    set runtimepath+=/boot/home/config/settings/vim
endif

"Windows compatibility section
"if has("win32") || has("win64")
if g:os == "Windows"
    source $VIMRUNTIME/vimrc_example.vim
    source $VIMRUNTIME/mswin.vim
    behave mswin

    set diffexpr=MyDiff()
    function MyDiff()
      let opt = '-a --binary '
      if &diffopt =~ 'icase' | let opt = opt . '-i ' | endif
      if &diffopt =~ 'iwhite' | let opt = opt . '-b ' | endif
      let arg1 = v:fname_in
      if arg1 =~ ' ' | let arg1 = '"' . arg1 . '"' | endif
      let arg2 = v:fname_new
      if arg2 =~ ' ' | let arg2 = '"' . arg2 . '"' | endif
      let arg3 = v:fname_out
      if arg3 =~ ' ' | let arg3 = '"' . arg3 . '"' | endif
      if $VIMRUNTIME =~ ' '
        if &sh =~ '\<cmd'
          if empty(&shellxquote)
            let l:shxq_sav = ''
            set shellxquote&
          endif
          let cmd = '"' . $VIMRUNTIME . '\diff"'
        else
          let cmd = substitute($VIMRUNTIME, ' ', '" ', '') . '\diff"'
        endif
      else
        let cmd = $VIMRUNTIME . '\diff'
      endif
      silent execute '!' . cmd . ' ' . opt . arg1 . ' ' . arg2 . ' > ' . arg3
      if exists('l:shxq_sav')
        let &shellxquote=l:shxq_sav
      endif
    endfunction
endif


"Features
if exists("SSH_CONNECTION")     "if this is an SSH session...
    set t_Co=16                 " ...then limit to 16 colors
    colorscheme 3dglasses       " ...and load a 16-color colorscheme...
else
    set t_Co=256                "DEBUG: Added this from Taylor's .vimrc file!

    "colorscheme wombat          " ...otherwise, load a colorscheme

    "set background=dark
    "set background=light
    "colorscheme solarized

    colorscheme ir_black

endif
syntax on                       "turns on syntax highlighting
set hlsearch                    "highlights search results
set list                        "shows the following whitespace characters:
set listchars=tab:>-,trail:-    "    tabs and trailing space
let g:tex_fold_enabled=1        "automatic text folding in LaTeX documents
let g:tex_flavor="latex"        "makes vim recognize all .tex files as LaTeX
"au BufWinLeave ?* mkview        "saves view on exiting vim
"au BufWinEnter ?* silent loadview   "reloads view when you re-open a file
                                    "(NOTE: sometimes this raises errors for new files)
"set spell                       "The spell-checker. I usually leave this off for
                                "writing code, and then set it manually
                                "with ":set spell when writing in English
set incsearch       "starts finding things in search while you type, including
                    "regexp. You can then do :%s//[replace-with]/g, since the //
                    "returns the last performed search!
set smartcase       "makes searches case-insensitive UNLESS the search string
                    "contains a capital letter

"Tabs and spaces
set expandtab       "spaces instead of tabs
set tabstop=4       "tabs are 4 spaces
set softtabstop=4   "keep things lined up to 4-width tabs
set shiftwidth=4
set smartindent     "Automatically indents new lines in code (intelligently)
set smarttab        "Goes to the nearest 4th space when you hit tab, instead of
                    "just adding four spaces

"Line wrapping
"set textwidth=80    "start new lines when you hit 80 characters
"set nowrap          "do not wrap lines that are past that 80-character limit
set textwidth=0     "unlimited textwidth
set wrap            "wrap lines that are past the edge of the screen

"Tabs and spaces in Makefiles
autocmd FileType make setlocal noexpandtab  "don't change Tabs if it's a Makefile

"Status bar
set laststatus=2  "always show status line
""Complete w/ column & line info
set statusline=%f%y%m%=[%0.3c,%0.9l/%0.9L][%p%%]
""Sparser
set statusline=%f%y%m%=[%p%%]
" %f - full path to file in current buffer, relative to working directory
" %y - type of file in buffer ([vim], [python], [matlab]...)
" %m - displays [+] if the file is modified, [-] if non-modifiable
" %= - switches to right-aligned items
" %0.3c - current column number, minimum width 0, max width 3
" %0.9l - current line, minimum width 0, max width 9
" %0.9L - total lines, minimum width 0, max width 9
" %p - percent of file at which the cursor resides
" %% - a literal percent sign


"Keyboard Mappings

""Remap the Esc key to be activated a couple of other ways
""(Eventually I'll decide on one!)
map  ;; <Esc>
map! ;; <Esc>
"map  `` <Esc>
"map! `` <Esc>

""Use the spacebar to center screen on the current line
map <SPACE> <ESC>zz
""Tabs! F7 = new, F8 = close, F5 = previous, F6 = next
"map <F7> <ESC>:tabe foo<CR>
"map <F8> <ESC>:tabclose<CR>
"map <F5> <ESC>:tabp<CR>
"map <F6> <ESC>:tabn<CR>
""For easy 'compiling' of TEX documents: 'Quiet' mode...
"map <F9>  <ESC>:!pdflatex % > /dev/null && clear<CR><CR>
"" ...and 'verbose' mode
"map <F10> <ESC>:!pdflatex %<CR><CR>
"map <C-R> <ESC>:!pdflatex %<CR><CR>


"Process the current file using MultiMarkdown, and display the output. On OS X
"hosts, this will use the nice GUI application Marked, while on Linux hosts
"it'll create an HTML file using markdown.pl or multimarkdown.pl and open it in Firefox
if has("unix")
    let s:uname = system("uname")
    if s:uname == "Darwin\n"
        "map <F5> <ESC>:!open -a "Marked 2" "%"<CR><CR>
        map <F5> <ESC>:!pandoc -s "%" > ~/pandoc_output.html; open ~/pandoc_output.html<CR><CR>
    elseif s:uname == "Linux\n"
        "Pandoc markdown processing
        map <F5> <ESC>:!pandoc -s "%" > ~/pandoc_output.html; firefox ~/pandoc_output.html<CR>
    endif
endif

" Turn on relative line numbers by default if you're not using the below Write
" and Code commands
set number
set relativenumber

""Commands to enter 'writing' and 'coding' modes, which switch line numbers on
""and off and change the 'scrolloff' (vertical centering) behavior
"command Code :set number | :set scrolloff=8 | set statusline=%f%y%m%=[%0.3c,%0.9l/%0.9L][%p%%]

"function Write()
"    set nonumber
"    set norelativenumber
"    set scrolloff=999
"    "set statusline=%=%t%m[%0.9l/%0.9L]
"    if has("unix")
"        if s:uname == "Darwin\n"
"            au FocusLost * :set norelativenumber
"            au FocusGained * :set norelativenumber
"            autocmd InsertEnter * :set norelativenumber
"            autocmd InsertLeave * :set norelativenumber
"        endif
"    endif
"endfunction
"command Write :call Write()
"
"function Code()
"    set number
"    set relativenumber
"    set scrolloff=8
"    "set statusline=%f%y%m%=[%0.3c,%0.9l/%0.9L][%p%%]
"    let s:uname = system("uname")
"    if has("unix")
"        if s:uname == "Darwin\n"
"            au FocusLost * :set norelativenumber
"            au FocusGained * :set relativenumber
"            autocmd InsertEnter * :set norelativenumber
"            autocmd InsertLeave * :set relativenumber
"        endif
"    endif
"endfunction
"command Code :call Code()


"Autocorrect Rules
iab teh the
iab bmc Barringer Meteorite Crater


"Extras
""Treat txt as markdown
"au BufNewFile,BufFilePre,BufRead *.txt set filetype=markdown
au BufRead,BufNewFile,BufFilePre *.txt set filetype=markdown

au BufNewFile,BufFilePre,BufRead *.md set filetype=markdown
""Treat Arduino .ino files as C
au BufNewFile,BufFilePre,BufRead *.ino set filetype=C
""Initiate the thesaurus
"set thesaurus+=~/.vim/moby_thesaurus/mthesaur.txt
""SuperTab completion
"let g:SuperTabDefaultCompletionType = \"<c-n>"
