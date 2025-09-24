// Minimal local type shim for Cloudflare Workers to avoid installing peer-conflicting packages
// Remove this file if you later install '@cloudflare/workers-types'.

export {}; // make this a module

type Awaitable<T> = T | Promise<T>;

/** Minimal shape compatible with `satisfies ExportedHandler` usage */
declare type ExportedHandler = {
  fetch?: (request: Request, env: any, ctx: any) => Awaitable<Response>;
  scheduled?: (controller: ScheduledController, env: any, ctx: any) => Awaitable<void>;
};

// Optional minimal ScheduledController to keep TS happy if referenced
declare interface ScheduledController {
  scheduledTime: number;
  cron?: string;
}