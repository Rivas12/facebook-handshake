import { useEffect, useState } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      AppEvents: {
        logPageView: () => void;
      };
      getLoginStatus: (callback: (response: FacebookAuthResponse) => void) => void;
      login: (callback: (response: FacebookAuthResponse) => void, options?: { scope: string }) => void;
    };
  }
}

export interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

export function useFacebookSDK() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const apiVersion = import.meta.env.VITE_FACEBOOK_API_VERSION;

    if (!appId || appId === 'your-app-id-here') {
      console.warn('Facebook App ID não configurado. Configure VITE_FACEBOOK_APP_ID no arquivo .env');
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: apiVersion || 'v18.0',
      });

      window.FB.AppEvents.logPageView();
      setIsInitialized(true);
    };

    // Carrega o SDK do Facebook
    (function (d: Document, s: string, id: string) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        setIsLoaded(true);
        return;
      }
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.onload = () => setIsLoaded(true);
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const getLoginStatus = (): Promise<FacebookAuthResponse> => {
    return new Promise((resolve) => {
      if (window.FB) {
        window.FB.getLoginStatus((response) => {
          resolve(response);
        });
      }
    });
  };

  const login = (scope = 'public_profile,email'): Promise<FacebookAuthResponse> => {
    return new Promise((resolve) => {
      if (window.FB) {
        window.FB.login((response) => {
          resolve(response);
        }, { scope });
      }
    });
  };

  return {
    isLoaded,
    isInitialized,
    getLoginStatus,
    login,
  };
}
