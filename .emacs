;; Get things working...
;;(setq package-enable-at-startup nil) (package-initialize)

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
;;(setq-default linum-mode t) ;;Turn on line numbers by default
(setq linum-format "%4d \u2502 ") ;;MUCH prettier formatting for line numbers (vertical bar!)
(add-hook 'text-mode-hook 'linum-mode) ;;Disable line numbers for text mode
(add-hook 'markdown-mode-hook 'linum-mode) ;;Disable line numbers for Markdown mode

;; Terminal encoding
(set-terminal-coding-system 'utf-8)
(set-keyboard-coding-system 'utf-8)
(prefer-coding-system 'utf-8)

;; Load .txt files as Markdown
(setq auto-mode-alist (cons '("\\.txt$" . markdown-mode) auto-mode-alist))

;; Theme notes (loaded below in Packages with "custom-enabled-themes")
;; wombat (higher-contrast, pretty)
;; zenburn-theme (muted, colorful; lighter background, still light-on-dark)
;; ir-black-theme (excellent and legible)
;; molokai-theme (bold, light-on-dark)
;; ample-theme (very much like molokai, but more muted - very pretty)
;; leuven-theme (light, with bright colors)
;; eink-theme (interesting beiges)

;; Packages
(require 'package)
(add-to-list 'package-archives
    '("melpa" . "https://melpa.org/packages/")
    '("melpa-stable" . "https://stable.melpa.org/packages/"))
(package-initialize)
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(column-number-mode t)
 '(custom-enabled-themes (quote (molokai)))
 '(custom-safe-themes
   (quote
    ("7dbb593ad0fb90230b196ffbd6a503c3e9086925cc68f212e625a017b8c824a7" "71182be392aa922f3c05e70087a40805ef2d969b4f8f965dfc0fc3c2f5df6168" "3c98d13ae2fc7aa59f05c494e8a15664ff5fe5db5256663a907272869c4130dd" "b571f92c9bfaf4a28cb64ae4b4cdbda95241cd62cf07d942be44dc8f46c491f4" "5436e5df71047d1fdd1079afa8341a442b1e26dd68b35b7d3c5ef8bd222057d1" "d9dab332207600e49400d798ed05f38372ec32132b3f7d2ba697e59088021555" "fcecf5757b909acbacc4fea2fa6a5fb9a63776be43cbff1dc0dffc9c02674478" "7790dbc91156dd9a5c7f2ee99e5f7e6549f244038b46ed6352d7693be2e0aec6" "12670281275ea7c1b42d0a548a584e23b9c4e1d2dabb747fd5e2d692bcd0d39b" "a62f0662e6aa7b05d0b4493a8e245ab31492765561b08192df61c9d1c7e1ddee" "3e34e9bf818cf6301fcabae2005bba8e61b1caba97d95509c8da78cff5f2ec8e" "b3bcf1b12ef2a7606c7697d71b934ca0bdd495d52f901e73ce008c4c9825a3aa" "73ad471d5ae9355a7fa28675014ae45a0589c14492f52c32a4e9b393fcc333fd" "eae831de756bb480240479794e85f1da0789c6f2f7746e5cc999370bbc8d9c8a" "5a7830712d709a4fc128a7998b7fa963f37e960fd2e8aa75c76f692b36e6cf3c" "076a94693c0f6fa99612121c18ccb48bfbd842c05b6b9ed04b6e7e0a0f95a53e" "afbb40954f67924d3153f27b6d3399df221b2050f2a72eb2cfa8d29ca783c5a8" "9be1d34d961a40d94ef94d0d08a364c3d27201f3c98c9d38e36f10588469ea57" "aea30125ef2e48831f46695418677b9d676c3babf43959c8e978c0ad672a7329" "85e6bb2425cbfeed2f2b367246ad11a62fb0f6d525c157038a0d0eaaabc1bfee" "01e067188b0b53325fc0a1c6e06643d7e52bc16b6653de2926a480861ad5aa78" "cbd8e65d2452dfaed789f79c92d230aa8bdf413601b261dbb1291fb88605110c" "78c1c89192e172436dbf892bd90562bc89e2cc3811b5f9506226e735a953a9c6" "21fb497b14820147b2b214e640b3c5ee19fcadc15bc288e3c16c9c9575d95d66" "16dd114a84d0aeccc5ad6fd64752a11ea2e841e3853234f19dc02a7b91f5d661" "ef04dd1e33f7cbd5aa3187981b18652b8d5ac9e680997b45dc5d00443e6a46e3" "25c242b3c808f38b0389879b9cba325fb1fa81a0a5e61ac7cae8da9a32e2811b" "4aee8551b53a43a883cb0b7f3255d6859d766b6c5e14bcb01bed572fcbef4328" default)))
 '(markdown-command "pandoc -s")
 '(package-selected-packages
   (quote
    (molokai-theme ample-theme zenburn-theme ir-black-theme eink-theme color-theme-sanityinc-solarized airline-themes evil-visual-mark-mode pandoc-mode evil-tutor evil slime markdown-mode)))
 '(show-paren-mode t))


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
