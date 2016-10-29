;; Don't display a startup message
(setq inhibit-startup-message t)

;; Something with region highlighting???
(setq-default transient-mark-mode t)

;; Make it so that tab always indents to the tab-to-tab-stop list
;;(global-set-key (kbd "TAB") 'tab-to-tab-stop)

;; Permanently force Emacs to indent with spaces, never with TABs:
(setq-default indent-tabs-mode nil)

;; Line wrapping
(setq fill-column 20)
(setq auto-fill-mode t)

;; Load .txt files as Markdown
(setq auto-mode-alist (cons '("\\.txt$" . markdown-mode) auto-mode-alist))

;; Packages
(require 'package)
(add-to-list 'package-archives
	     '("melpa-stable" . "https://stable.melpa.org/packages/"))
(package-initialize)
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(markdown-command "pandoc -s")
 '(package-selected-packages (quote (slime markdown-mode))))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )

;; Markdown options
(setq markdown-open-command "pandoc -s")

;; Getting SLIME working
(setq inferior-lisp-program "/usr/local/bin/sbcl")


;;;; Terminal encoding
;;(set-terminal-coding-system 'utf-8)
;;(set-keyboard-coding-system 'utf-8)
;;(prefer-coding-system 'utf-8)
;;
;;;;(require 'package)
;;;;(add-to-list 'package-archives
;;;;             '("melpa-stable" . "https://stable.melpa.org/packages/"))
;;;;(when (< emacs-major-version 24)
;;  ;; For important compatibility libraries like cl-lib
;;;;  (add-to-list 'package-archives '("gnu" . "http://elpa.gnu.org/packages/")))
;;;;(package-initialize)
;;
;;;;(custom-set-variables
;; ;; Custom-set-variables was added by Custom.
;; ;; If you edit it by hand, you could mess it up, so be careful.
;; ;; Your init file should contain only one such instance.
;; ;; If there is more than one, they won't work right.
;;;; '(blink-cursor-mode t)
;;;; '(show-paren-mode t))
;;
;;;; Key bindings
;;(when (eq system-type 'darwin) ;;macOS settings
;;  (setq mac-option-modifer 'alt)
;;  (global-set-key [kp-delete] 'delete-char)
;;  )
;;
;;;; Text width & auto-wrapping
;;(setq fill-column 20)
;;(auto-fill-mode t)
