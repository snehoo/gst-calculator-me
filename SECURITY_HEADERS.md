# Security Headers Configuration

This document describes the HTTP security headers configured for gstcalculator.me.

## Deployment Configuration

Security headers are configured differently depending on your hosting platform:

### For Vercel
- Configuration file: `vercel.json`
- Handles HTTP → HTTPS redirect automatically
- Handles www → non-www redirect automatically
- Deploy and headers are applied instantly

### For Netlify
- Configuration file: `public/_headers`
- Redirect file: `public/_redirects`
- Both files must be in the `dist/` output folder after build
- Headers are automatically included in your build output

## Security Headers Explained

### 1. Strict-Transport-Security (HSTS)
```
max-age=31536000; includeSubDomains
```
- Enforces HTTPS for 1 year (31536000 seconds)
- Protects against downgrade attacks
- `includeSubDomains` applies to all subdomains

### 2. X-Content-Type-Options
```
nosniff
```
- Prevents browsers from MIME-sniffing
- Forces Content-Type to be respected
- Prevents executable file attacks

### 3. X-Frame-Options
```
SAMEORIGIN
```
- Prevents clickjacking attacks
- Allows framing only from same origin
- Protects against malicious embedding

### 4. Referrer-Policy
```
strict-origin-when-cross-origin
```
- Balances privacy and functionality
- Full referrer for same-origin requests
- Only origin for cross-origin requests
- No referrer for insecure → secure downgrade

### 5. Permissions-Policy
```
camera=(), microphone=(), geolocation=()
```
- Disables unused dangerous APIs
- Prevents accidental or malicious use
- Empty list means completely blocked

### 6. Content-Security-Policy (CSP)

#### Default policy
```
default-src 'self'
```
- Only allow resources from same origin by default
- Whitelist is required for anything external

#### Script sources
```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com
```
- `'self'`: Bundle JavaScript
- `'unsafe-inline'`: Inline scripts (React bundle needs this)
- `https://www.googletagmanager.com`: Google Analytics
- `https://pagead2.googlesyndication.com`: Google AdSense

#### Style sources
```
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```
- `'self'`: Local stylesheets
- `'unsafe-inline'`: Inline styles (Tailwind/shadcn uses this)
- `https://fonts.googleapis.com`: Google Fonts CSS

#### Font sources
```
font-src 'self' https://fonts.gstatic.com
```
- `'self'`: Local fonts
- `https://fonts.gstatic.com`: Google Fonts files

#### Image sources
```
img-src 'self' data: https: blob:
```
- `'self'`: Local images
- `data:`: Data URIs (icons, small images)
- `https:`: Any HTTPS image source
- `blob:`: Generated images (e.g., charts)

#### Connection sources
```
connect-src 'self' https://wa.me https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://storage.googleapis.com
```
- `'self'`: Same-origin API calls
- `https://wa.me`: WhatsApp share link
- `https://www.google-analytics.com`: Analytics beacon
- `https://www.googletagmanager.com`: GTM data collection
- `https://pagead2.googlesyndication.com`: AdSense metrics
- `https://storage.googleapis.com`: External images

#### Other directives
```
media-src 'self' https:
manifest-src 'self'
frame-src 'self'
```
- Media: Audio/video files
- Manifest: PWA manifest
- Frames: Embedded content

## HTTP Redirects

### HTTP → HTTPS
- **Status Code**: 301 (Permanent Redirect)
- **Vercel**: Automatic
- **Netlify**: Configured in `_redirects`

### www → non-www
- **Status Code**: 301 (Permanent Redirect)
- **Vercel**: Configured in `vercel.json`
- **Netlify**: Configured in `_redirects`
- **Direction**: www.gstcalculator.me → gstcalculator.me

## Testing

### Test HSTS header
```bash
curl -I https://gstcalculator.me | grep -i "Strict-Transport-Security"
```

### Test all security headers
```bash
curl -I https://gstcalculator.me
```

### Test HTTP → HTTPS redirect
```bash
curl -I http://gstcalculator.me
# Should return: HTTP/1.1 301 Moved Permanently
```

### Test www → non-www redirect
```bash
curl -I https://www.gstcalculator.me
# Should return: HTTP/1.1 301 Moved Permanently
```

## CSP Violations

If legitimate content is blocked by CSP, check the browser console for errors like:
```
Refused to load the script from 'https://example.com/script.js' because it violates the following Content-Security-Policy directive: "default-src 'self'"
```

To fix:
1. Identify the blocked domain
2. Update the appropriate CSP directive in `vercel.json` or `public/_headers`
3. Redeploy

**Never use `'unsafe-eval'`** — it defeats the security benefits of CSP.

## Caching Strategy

### Immutable assets (hash-based filenames)
- JavaScript bundles: `max-age=31536000, immutable`
- CSS files: `max-age=31536000, immutable`
- Images: `max-age=31536000, immutable`

### Mutable assets (no caching)
- HTML files: `max-age=0, must-revalidate`
- API responses: `max-age=0, must-revalidate`

This ensures users always get the latest HTML while cached assets load instantly.

## Monitoring

Set up alerts for:
- CSP violation reports
- HTTPS certificate expiration
- Server response time changes

CSP violations can be monitored by adding a `report-uri` or `report-to` directive (not included by default for privacy).
