import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="fixed inset-0 bg-noise pointer-events-none" />
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 text-center px-6"
    >
      <div className="text-6xl mb-4">🤷</div>
      <h1 className="text-2xl font-extrabold text-foreground mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button className="h-11 rounded-2xl bg-primary px-6 font-bold gap-2 shadow-lg shadow-primary/15">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
