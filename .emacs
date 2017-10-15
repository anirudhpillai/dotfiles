(custom-set-variables
 '(custom-enabled-themes (quote (wombat)))
 '(blink-cursor-mode nil)
 '(menu-bar-mode nil)
 '(nil nil t))

(custom-set-faces
 '(default ((t (:inherit nil :stipple nil :inverse-video nil :box nil :strike-through nil :overline nil :underline nil :slant normal :weight normal :height 1 :width normal :foundry "default" :family "Ubuntu Mono")))))

(setq make-backup-files nil) ; stop creating backup~ files
(setq auto-save-default nil) ; stop creating #autosave# files
(electric-pair-mode 1) ;; auto close bracket insertion

;; Open .v files with Proof General's Coq mode
(load "~/.emacs.d/lisp/PG/generic/proof-site")

;; Setting font size for window mode
(set-face-attribute 'default nil :height 120)

;; Hide Scrollbar
(toggle-scroll-bar -1)

