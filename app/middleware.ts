import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Routes that need Clerk session context but are open (e.g. sign-in flows
// and Clerk's own webhooks). All embed/public surfaces are excluded from
// the matcher entirely below — they never reach Clerk middleware, which
// prevents Clerk from stamping `cache-control: private, no-store` on
// otherwise CDN-cacheable responses.
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next internals, static assets, AND every public embed/submit/track
    // surface so they bypass Clerk entirely and keep their ISR
    // `cache-control: public, s-maxage=…` headers. The negative lookahead at
    // the start enumerates every prefix Clerk should NOT touch.
    '/((?!_next|widget|wall|submit|embed|api/forms/public|api/walls/public|api/submissions|api/track|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
