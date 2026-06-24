import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

export default function VerifyButton({ isPending, disabled }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="w-full mt-2"
    >
      <Button
        type="submit"
        disabled={disabled || isPending}
        className="w-full h-[52px] bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_25px_rgba(109,40,217,0.35)] border-0 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none"
      >
        {isPending ? (
          <>
            <Spinner className="size-5 text-white" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Continue</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
          </>
        )}
      </Button>
    </motion.div>
  );
}
