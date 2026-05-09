/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_USE_TESTNET: string;
    // Add other VITE_ env variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
