import React from 'react';
import { Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import { Coins02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/30">
      <div className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-primary/12 flex items-center justify-center">
                <HugeiconsIcon icon={Coins02Icon} color='hsl(258,72%,58%)' />

              </div>
              <span className="text-[15px] font-bold tracking-tight text-foreground">
                Pay<span className="text-primary">Anywhere</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Cross-chain payment links. Powered by Solana, LI.FI, and x402.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              {[
                { label: 'Solana', href: 'https://solana.com' },
                { label: 'LI.FI', href: 'https://li.fi' },
                { label: 'Anchor', href: 'https://anchor-lang.com' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium"
                >
                  {item.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
            <a href="#" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Solana Colosseum Hackathon</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold badge-settled px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Devnet
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
