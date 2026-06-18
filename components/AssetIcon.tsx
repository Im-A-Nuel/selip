// Crisp inline-SVG token + chain icons for the funding source list. No network,
// no deps; brand colors approximate the official marks.

const TOKENS: Record<string, React.ReactNode> = {
  USDC: (
    <svg viewBox="0 0 32 32" className="h-full w-full">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        fill="#fff"
        d="M16 6.2c-5.4 0-9.8 4.4-9.8 9.8S10.6 25.8 16 25.8 25.8 21.4 25.8 16 21.4 6.2 16 6.2Zm-1 15.6c-2.9-.4-5-2.8-5-5.8s2.1-5.4 5-5.8v1.7c-1.9.4-3.3 2.1-3.3 4.1s1.4 3.7 3.3 4.1v1.7Zm1-9.9c.9.1 1.6.9 1.6 1.8h1.6c0-1.7-1.3-3.2-3.2-3.4V10h-1.6v1.4c-1.9.2-3.2 1.5-3.2 3.1 0 1.9 1.2 2.7 3.2 3.1v3.1c-.9-.1-1.6-.9-1.6-1.8h-1.6c0 1.7 1.3 3.2 3.2 3.4V22h1.6v-1.6c1.9-.2 3.2-1.5 3.2-3.2 0-1.9-1.2-2.7-3.2-3.1v-2.2Z"
      />
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 32 32" className="h-full w-full">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path fill="#fff" fillOpacity=".9" d="M16.5 4v8.87l7.5 3.35z" />
      <path fill="#fff" d="M16.5 4 9 16.22l7.5-3.35z" />
      <path fill="#fff" fillOpacity=".9" d="M16.5 21.97V28L24 17.62z" />
      <path fill="#fff" d="M16.5 28v-6.03L9 17.62z" />
      <path fill="#fff" fillOpacity=".5" d="m16.5 20.57 7.5-4.35-7.5-3.34z" />
      <path fill="#fff" fillOpacity=".7" d="m9 16.22 7.5 4.35v-7.69z" />
    </svg>
  ),
};

const CHAINS: Record<string, string> = {
  Base: "#0052FF",
  Arbitrum: "#28A0F0",
  Optimism: "#FF0420",
  Polygon: "#8247E5",
};

export function AssetIcon({ token, chain }: { token: string; chain: string }) {
  return (
    <span className="relative inline-block h-8 w-8 shrink-0">
      <span className="block h-8 w-8 overflow-hidden rounded-full ring-1 ring-black/5">
        {TOKENS[token] ?? (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-ink/10 text-xs font-bold">
            {token.slice(0, 2)}
          </span>
        )}
      </span>
      <span
        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
        style={{ background: CHAINS[chain] ?? "#999" }}
        title={chain}
      />
    </span>
  );
}
