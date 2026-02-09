/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_BASE_URL?: string;
  readonly REACT_APP_CLIENT_ID?: string;
  readonly REACT_APP_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
