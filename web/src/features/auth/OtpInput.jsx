import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function OtpInput({ value, onChange, hasError }) {
  const [values, setValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Sync value from parent if needed (e.g., reset)
  useEffect(() => {
    if (!value) {
      setValues(['', '', '', '', '', '']);
    }
  }, [value]);

  const handleChange = (index, val) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1); // only digits, take last char
    const newValues = [...values];
    newValues[index] = cleanVal;
    setValues(newValues);
    onChange(newValues.join(''));

    // Auto Focus Next
    if (cleanVal !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newValues = [...values];
      if (values[index] !== '') {
        // Clear current index
        newValues[index] = '';
        setValues(newValues);
        onChange(newValues.join(''));
      } else if (index > 0) {
        // Backspace moves focus backward and clears previous input
        inputRefs.current[index - 1]?.focus();
        newValues[index - 1] = '';
        setValues(newValues);
        onChange(newValues.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newValues = [...values];
    for (let i = 0; i < 6; i++) {
      if (pasteData[i] !== undefined) {
        newValues[i] = pasteData[i];
      }
    }
    setValues(newValues);
    onChange(newValues.join(''));

    // Focus last populated slot or next slot
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2.5 md:gap-3 justify-center select-none">
      {values.map((digit, index) => {
        const isFocused = document.activeElement === inputRefs.current[index];
        const isFilled = digit !== '';

        let borderClass = 'border-white/10';
        let bgClass = 'bg-[#161525]';
        let textClass = 'text-[#EEEAF8]';

        if (hasError) {
          borderClass = 'border-[#F43F5E]';
          textClass = 'text-[#F43F5E]';
        } else if (isFilled) {
          borderClass = 'border-violet-400 bg-violet-500/10';
          textClass = 'text-white';
        }

        return (
          <motion.div
            key={index}
            // Trigger scale scale 1 -> 1.05 -> 1 on value change
            animate={isFilled ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.15 }}
            className="w-11 h-[52px] md:w-12 md:h-14"
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-full h-full text-center text-lg font-bold rounded-[14px] border transition-all duration-200 outline-none select-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.35)] ${bgClass} ${borderClass} ${textClass}`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
