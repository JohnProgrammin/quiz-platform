import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Dialog/Modal Component (Radix UI + Framer Motion)
 * Accessible, animated modal for important user interactions
 */
export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-md',
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            </motion.div>

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RadixDialog.Content
                className={`${maxWidth} w-full mx-4 bg-white rounded-2xl shadow-2xl pointer-events-auto`}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', duration: 0.3 }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        {title && (
                          <RadixDialog.Title className="text-2xl font-bold text-gray-900">
                            {title}
                          </RadixDialog.Title>
                        )}
                        {description && (
                          <RadixDialog.Description className="text-gray-600 mt-1">
                            {description}
                          </RadixDialog.Description>
                        )}
                      </div>
                      <RadixDialog.Close asChild>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <X size={24} />
                        </button>
                      </RadixDialog.Close>
                    </div>

                    {/* Body */}
                    <div className="my-6">{children}</div>

                    {/* Footer */}
                    {footer && <div className="flex gap-3 justify-end border-t pt-6">{footer}</div>}
                  </div>
                </motion.div>
              </RadixDialog.Content>
            </motion.div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
};

export default Dialog;
