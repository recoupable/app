import React from "react";
import { Action } from "@/components/actions";
import { CopyIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCopy } from "@/hooks/useCopy";

interface CopyActionProps {
  text: string;
}

const CopyAction: React.FC<CopyActionProps> = ({ text }) => {
  // silent: the animated tick below is already the confirmation, and a toast
  // per copy would be noise in a chat where you copy often.
  const { copied: isCopied, copy } = useCopy(1500, { silent: true });

  return (
    <Action
      onClick={() => copy(text)}
      label="Copy"
      tooltip="Copy response to clipboard"
    >
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="!w-3 !h-3" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.15 }}
          >
            <CopyIcon className="!w-3 !h-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </Action>
  );
};

export default CopyAction;
