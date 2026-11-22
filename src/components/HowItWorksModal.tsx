import { useState } from "react";
import { HelpCircle, ShieldCheck, Trophy, Coins, X } from "lucide-react";

export function HowItWorksModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="How it works"
        title="How it works"
        className="glass inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors hover:border-[var(--border-strong)]"
        style={{ color: "var(--ink)" }}
      >
        <HelpCircle className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <span className="hidden sm:inline">How it works</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border-strong)",
              color: "var(--ink)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 id="how-it-works-title" className="display text-2xl font-bold">
                  How It Works
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                  Non-custodial Parimutuel Prediction Market on Base Mainnet
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close modal"
                className="glass inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:border-[var(--border-strong)]"
                style={{ color: "var(--ink)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="glass-inner rounded-2xl p-4">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Coins className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  <span>1. Pick YES or NO &amp; Stake USDC</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  All bets go into a shared on-chain USDC pool. Multipliers adjust dynamically based on the ratio between YES and NO stakes until the market deadline closes.
                </p>
              </div>

              <div className="glass-inner rounded-2xl p-4">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Trophy className="h-4 w-4" style={{ color: "var(--success)" }} />
                  <span>2. Winners Split the Losing Pool</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  Once the outcome is resolved on-chain, winners recover their original stake plus a proportional share of the losing pool (minus a 5% protocol fee on net winnings).
                </p>
              </div>

              <div className="glass-inner rounded-2xl p-4">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  <span>3. 3-Day 100% Refund Guarantee</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  If a market is not resolved within 72 hours after its deadline, anyone can trigger a full 100% refund of their staked USDC with zero protocol fees.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-primary mt-6 w-full rounded-full py-2.5 text-sm font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
