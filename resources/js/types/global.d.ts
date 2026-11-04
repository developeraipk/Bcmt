export {};

declare global {
  function route(name?: string, params?: any): any;
  interface Window {
    route: (name?: string, params?: any) => any;
  }
}
