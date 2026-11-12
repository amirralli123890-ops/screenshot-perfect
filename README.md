# New Digital World

English-language technology publication built with React 19, TypeScript, Tailwind CSS 4, TanStack Start and Lovable Cloud.

## Start publishing

1. Open `/auth`, choose **Create a reader account**, and use the designated initial administrator email `amirralli123890@gmail.com`.
2. Confirm that email using the secure confirmation message. The database assigns initial super-administrator access only to that verified address, and only if no super administrator exists. No password is shipped in source.
3. Sign in and open **Your account → Open editorial dashboard**, or `/admin`.
4. Use **New article**, write content, select a category, upload a featured image, and save a draft or explicitly publish.
5. **Manage admins** sends secure invitations for editor accounts. Editors can manage articles, images, and comments, but cannot change categories, site settings, contact messages or account permissions.
6. Enter the actual published origin under **Website settings → Canonical URL**, without a trailing slash. This enables the XML sitemap and canonical links. Add the Instagram URL when available. Other social fields are reserved and hidden initially.

The public site deliberately has no seeded articles or fabricated statistics. Six requested categories are present. Contact email: `munebdeveloper034392@gmail.com`.

## Data and security

- The existing Lovable Cloud connection already supplies the database, authentication, and storage; no separate account is needed.
- `profiles` stores reader display names. `user_roles` is separate and cannot be written by readers.
- Public article reads return only published rows; staff can read and manage drafts.
- Comment names/content are public, but email addresses reside in service-only `comment_contacts`.
- Contact messages are super-admin-only. Guest submissions use validated server functions; direct anonymous writes are not permitted.
- Server-sanitized article HTML preserves rich-text formatting while removing executable markup.
- Private `article-images` accepts JPG, PNG and WebP up to 5 MB. Staff-only upload policies enforce editorial access. `/api/public/image` delivers an image only if a published article references it. Unpublished media remains private.
- Database-backed atomic submission limits: three contact messages and ten comments per hour, checked independently against a hashed email and available trusted request IP. These are pragmatic custom controls, not a full bot-detection service.
- Email confirmation stays enabled. Recovery requires the `/reset-password` page. Invitation links also return there.

## Local development

```sh
bun install
bun run dev
bun run test
```

Browser-visible configuration is injected into the generated client. Privileged configuration remains server-only. Never commit secrets or manually edit generated integration files.

## Deployment

### Lovable

Publish from the editor. The publication and server functions ship together; the Cloud schema is already applied. Set the real website address in website settings afterward.

### Netlify preparation and limitation

`netlify.toml` selects the Nitro `netlify` target with `NITRO_PRESET=netlify`. The managed bootstrap otherwise retains its normal Cloudflare target for Lovable. Nitro generates server-function routing; this application is SSR, **not** a static SPA. Do not add a blanket `/index.html` redirect, which would break articles and server functions.

Connect the repository to Netlify, install with Bun, use `bun run build`, and publish `dist/client`. Nitro emits the Netlify functions and redirects. Check generated output paths in the deployment logs; the Netlify deployment itself has not been run from this workspace.

An externally hosted application must have its own independently provisioned backend configuration. Managed Lovable Cloud service credentials are not exportable; **the complete current app cannot be moved unchanged to Netlify using only the browser/public key**. To host externally, provision an external backend, apply the SQL migrations through its administration tools, create the private `article-images` bucket using its Storage API, seed the six categories and settings, and securely set:

- Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.
- Server: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

The service-role credential must exist **only** in protected Netlify environment variables. Update the backend auth Site URL and redirect allow-list for the actual Netlify/custom-domain origin, including `/reset-password`. Never expose server credentials with a `VITE_` prefix.

The proposed `roxanadigitalworld.netlify.app` address is not reserved or verified; check availability in Netlify when creating the site. No custom domain is assumed.

## Advertising and legal review

Ad placements are empty reserved areas by default, not fake ads. Settings accept only an approved AdSense publisher ID and numeric slot IDs, not arbitrary executable code. AdSense rendering must only be activated after approval and after meeting local consent requirements. No consent banner or automatic advertisement popup is included. Approval is never guaranteed.

The About, Privacy, Terms and Disclaimer text is an initial draft written for this implementation, not legal advice. The owner should review policies and retention requirements before public launch. The supplied Gmail contact address is a public contact address, not a verified transactional-email sender.

## Verification

20 automated rules/routing tests pass. Browser checks exercised every public page, administrator/editor/reader sign-in, real draft save and publishing, private image upload and public delivery, guest comments/replies, public email privacy, search, private contact inbox and mobile/desktop rendering. Temporary verification content and accounts are removed after testing.

Outstanding external checks: actual owner email confirmation, editor-invitation email delivery and recovery-link round trip, live Netlify deployment and domain availability, AdSense approval/compliance. These require their respective email/hosting services and are not implied by local tests.
