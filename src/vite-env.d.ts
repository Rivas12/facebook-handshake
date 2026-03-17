/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FACEBOOK_APP_ID: string;
  readonly VITE_FACEBOOK_API_VERSION: string;
  readonly VITE_FACEBOOK_CODE_POST_URL: string;
  readonly VITE_FACEBOOK_REDIRECT_URI?: string;
  readonly VITE_FACEBOOK_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
