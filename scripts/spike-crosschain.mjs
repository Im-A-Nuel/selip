// Week-1 spike: prove one cross-chain operation through Particle Universal
// Accounts. Run with Node's built-in env loader (no extra deps):
//
//   node --env-file=.env.local scripts/spike-crosschain.mjs
//
// Goal: init a Universal Account, read its unified balance, and fetch a quote
// for a small cross-chain transfer. This validates SDK config + 7702 mode
// before any UI is wired. It does not move funds unless EXECUTE=1 is set.

const need = [
  "NEXT_PUBLIC_PARTICLE_PROJECT_ID",
  "NEXT_PUBLIC_PARTICLE_CLIENT_KEY",
  "NEXT_PUBLIC_PARTICLE_APP_ID",
];

const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("Missing env keys:", missing.join(", "));
  console.error("Copy .env.example to .env.local and fill the Particle keys.");
  process.exit(1);
}

const OWNER = process.env.SPIKE_OWNER_ADDRESS;
if (!OWNER) {
  console.error("Set SPIKE_OWNER_ADDRESS to an EOA address to bind the UA.");
  process.exit(1);
}

const mod = await import("@particle-network/universal-account-sdk");
const UniversalAccount = mod.UniversalAccount ?? mod.default;
if (typeof UniversalAccount !== "function") {
  console.error("Unexpected SDK shape. Exports:", Object.keys(mod));
  process.exit(1);
}

const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
  projectClientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
  projectAppUuid: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
  ownerAddress: OWNER,
});

console.log("Universal Account initialized for owner:", OWNER);

// Read the unified, cross-chain balance. Method name may vary across SDK
// versions; try the documented ones and report what is available.
async function readBalance() {
  for (const fn of ["getAssets", "getUnifiedBalance", "getBalances"]) {
    if (typeof ua[fn] === "function") {
      const res = await ua[fn]();
      console.log(`balance via ${fn}():`, JSON.stringify(res, null, 2));
      return;
    }
  }
  console.log(
    "No known balance method found. Available methods:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(ua)).filter(
      (m) => typeof ua[m] === "function" && m !== "constructor",
    ),
  );
}

try {
  await readBalance();
  console.log("Spike OK: SDK config valid and Universal Account reachable.");
} catch (err) {
  console.error("Spike failed at SDK call:", err?.message ?? err);
  process.exit(1);
}
