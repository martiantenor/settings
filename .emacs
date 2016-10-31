;; Don't display a startup message
(setq inhibit-startup-message t)

;; Something with region highlighting???
(setq-default transient-mark-mode t)

;; Make it so that tab always indents to the tab-to-tab-stop list
;;(global-set-key (kbd "TAB") 'tab-to-tab-stop)

;; Permanently force Emacs to indent with spaces, never with TABs:
(setq-default indent-tabs-mode nil)

;; Tab spacing settings
(setq-default tab-stop-list '(1 5 9))

;; Line wrapping
(setq fill-column 80) ;;Line wrap width
;;(setq auto-fill-mode t) ;;Automatic line wrapping
(add-hook 'markdown-mode-hook 'adaptive-wrap-prefix-mode) ;;Indent wrapped lines the right amount
(add-hook 'markdown-mode-hook 'visual-line-mode) ;;Prettier line wrapping
(add-hook 'text-mode-hook 'adaptive-wrap-prefix-mode) ;;Indent wrapped lines the right amount
(add-hook 'text-mode-hook 'visual-line-mode) ;;Prettier line wrapping

;; Line numbering
(setq-default linum-mode t) ;;Turn on line numbers by default
(setq linum-format "%4d \u2502 ") ;;MUCH prettier formatting for line numbers (vertical bar!)
(add-hook 'text-mode-hook 'linum-mode) ;;Disable line numbers for text mode
(add-hook 'markdown-mode-hook 'linum-mode) ;;Disable line numbers for Markdown mode

;; Terminal encoding
(set-terminal-coding-system 'utf-8)
(set-keyboard-coding-system 'utf-8)
(prefer-coding-system 'utf-8)

;; Load .txt files as Markdown
(setq auto-mode-alist (cons '("\\.txt$" . markdown-mode) auto-mode-alist))

;; Packages
(require 'package)
(add-to-list 'package-archives
    '("melpa-stable" . "https://stable.melpa.org/packages/")
    '("melpa" . "https://melpa.org/packages/"))
(package-initialize)
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(custom-safe-themes
   (quote
    ("cbd8e65d2452dfaed789f79c92d230aa8bdf413601b261dbb1291fb88605110c" "78c1c89192e172436dbf892bd90562bc89e2cc3811b5f9506226e735a953a9c6" "21fb497b14820147b2b214e640b3c5ee19fcadc15bc288e3c16c9c9575d95d66" "16dd114a84d0aeccc5ad6fd64752a11ea2e841e3853234f19dc02a7b91f5d661" "ef04dd1e33f7cbd5aa3187981b18652b8d5ac9e680997b45dc5d00443e6a46e3" "25c242b3c808f38b0389879b9cba325fb1fa81a0a5e61ac7cae8da9a32e2811b" "4aee8551b53a43a883cb0b7f3255d6859d766b6c5e14bcb01bed572fcbef4328" default)))
 '(markdown-command "pandoc -s" t)
 '(show-paren-mode t)
 '(package-selected-packages
   (quote
    (ir-black-theme eink-theme color-theme-sanityinc-solarized base16-theme airline-themes evil-visual-mark-mode pandoc-mode evil-tutor evil slime markdown-mode))))


(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )

;; Mouse support (works in OS X)
(unless window-system
  (require 'mouse)
  (xterm-mouse-mode t)
  (global-set-key [mouse-4] (lambda ()
                              (interactive)
                              (scroll-down 1)))
  (global-set-key [mouse-5] (lambda ()
                              (interactive)
                              (scroll-up 1))))


;; Make every Markdown file use the pandoc-mode minor mode
(add-hook 'markdown-mode-hook 'pandoc-mode)

;; Load .txt files as Markdown
(setq auto-mode-alist (cons '("\\.txt$" . markdown-mode) auto-mode-alist))

;; Getting SLIME working
(setq inferior-lisp-program "/usr/local/bin/sbcl")

;;;; Key bindings
;;(when (eq system-type 'darwin) ;;macOS settings
;;  (setq mac-option-modifer 'alt)
;;  (global-set-key [kp-delete] 'delete-char)
;;  )

