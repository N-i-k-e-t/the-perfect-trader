# Security Policy

## Reporting a vulnerability

Email **support@theperfecttrader.app** with:

- Description of the issue
- Steps to reproduce
- Potential impact

We aim to acknowledge reports within **48 hours** and fix confirmed issues within **14 days**.

Please do not publicly disclose vulnerabilities until we have responded.

See also: [/.well-known/security.txt](https://the-perfect-trader.vercel.app/.well-known/security.txt) and [/security](https://the-perfect-trader.vercel.app/security).

## Scope

In scope:

- Authentication or authorization bypass
- Cross-user data access (RLS failures)
- Remote code execution on our infrastructure
- Sensitive data exposure (API keys, other users' trades)

## Out of scope

- Denial of service via excessive traffic (rate limits apply)
- Social engineering or phishing
- Issues in third-party services (Supabase, Vercel, Resend) — report to them directly
- Missing security headers on static marketing pages with no user data

## Bug bounty

No paid bug bounty during beta. We appreciate responsible disclosure.
