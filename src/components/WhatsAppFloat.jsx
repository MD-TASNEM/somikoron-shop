import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat = () => {
  return (
    <motion.a
      href="https://wa.me/8801996570203"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-success text-white rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(37,211,102,0.3)] glass"
    >
      <MessageCircle className="w-7 h-7 fill-current" />
    </motion.a>
  );
};
