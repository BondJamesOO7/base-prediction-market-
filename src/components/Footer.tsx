import { Github, ExternalLink } from "lucide-react";

const CONTRACT_ADDRESS = "0x3664C64507a0d017B5dA163418389C851b68F62F";
const GITHUB_REPO_URL = "https://github.com";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>
              Powered by <strong className="text-foreground">Base Sepolia</strong> · Parimutuel Prediction Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://basescan.org{CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              <span>Contract on Basescan</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <span className="text-border">|</span>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
              aria-label="View source code on GitHub"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>

            <span className="text-border">|</span>

            <span>5% Protocol Fee · 3-Day Refund Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
