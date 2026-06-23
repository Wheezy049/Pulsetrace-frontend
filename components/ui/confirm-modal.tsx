"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary" | "warning";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-4">
              {/* Icon */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === "destructive" 
                  ? "bg-red-500/10 text-red-500" 
                  : variant === "warning" 
                  ? "bg-amber-500/10 text-amber-500" 
                  : "bg-primary/10 text-primary"
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">
                  {title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer px-4 py-2 text-xs"
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-md border-0 ${
                  variant === "destructive"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-primary hover:bg-primary/80 text-white"
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
