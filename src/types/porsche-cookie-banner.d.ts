// Typings for Porsche Cookie Consent Banner (Web Component)

// ESM loader export
declare module '@porscheofficial/cookie-consent-banner/dist/loader' {
  export function defineCustomElements(win?: any, opts?: any): void;
}

// Make the custom element valid in TSX/JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cookie-consent-banner': any;
    }
  }
}

export {};