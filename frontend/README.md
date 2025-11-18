## Escrow dApp Frontend

- Live app: https://escrow-frontend-nu.vercel.app/

This folder contains the Next.js frontend for the Escrow program. For full local setup, usage, and deployment instructions, see `frontend/escrow-program-frontend/README.md`.

Quick start (local):

1. Install and run

```
cd escrow-program-frontend
npm install
```

2. Create `.env.local` with:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=9pdSoyn1kfAN4bD4cWFTZCu82sg44tEAdTGVtKLpUoCd
```

3. Start dev server

```
npm run dev
```

Then open http://localhost:3000 and connect a Devnet wallet. For token setup and detailed workflows (Make/Take/Refund), follow the guide in `escrow-program-frontend/README.md`.
