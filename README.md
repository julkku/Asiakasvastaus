# Asiakasvastaus

Rotate Stripe test keys if ever exposed.

AI-ohjattu, Windows-ystävällinen **Next.js 14 / App Router** -projekti, joka tarjoaa räätälöidyt asiakasvastausluonnokset GPT-5 -mallilla. Sovellus sisältää kirjautumisen, istunnonhallinnan, Drizzle + SQLite -tietokannan sekä OpenAI Responses API -pohjaisen ydintuotteen.

## Tech Stack

- Next.js 14 (App Router) with TypeScript and Tailwind CSS (no middleware required)
- SQLite (`dev.db`) accessed through Better SQLite3 + Drizzle ORM (dev)
- Production requires Postgres (e.g. Neon) via `DATABASE_URL`
- Custom auth helpers with bcrypt hashing, session HMACs (SHA-256), and DB-stored sessions
- Server Actions for register/login, protected layouts for `/app/*` and `/onboarding`

## Quick Start (Windows)

1. **Install dependencies**
   ```bash
   npm install
   ```
   > `better-sqlite3` tarvitsee C++-työkalut. Asenna Visual Studio Build Tools (Desktop development with C++) sekä tuore Windows SDK, jotta node-gyp voi kääntää kirjaston.

2. **Kopioi ympäristömuuttujat**
   ```bash
   copy .env.example .env
   ```
   Täytä:
   - `SESSION_SECRET` → pitkä satunnainen merkkijono
   - `OPENAI_API_KEY` → vain palvelinpuolella käytettävä avain
   - `OPENAI_MODEL` → esim. `gpt-5-mini` (voit vaihtaa `gpt-5`)
   - `APP_URL` → esim. `http://localhost:3000`
   - `NEXT_PUBLIC_APP_URL` → esim. `http://localhost:3000`
   - `TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` → Cloudflare Turnstile rekisteröinnin CAPTCHA
   - `EMAIL_FROM` → lähettäjän osoite (tuotannossa)
   - `SMTP_URL` → SMTP-yhteys (tuotannossa)
   - `DEV_EMAIL_VERIFICATION_MODE` → kehitystilan vahvistus (link/button/off)
   - `STRIPE_SECRET_KEY` → Stripe salainen avain (palvelinpuolella)
   - `STRIPE_WEBHOOK_SECRET` → Stripe webhookien allekirjoitusavain
   - `STRIPE_PRICE_ID` → kuukausihinnan Stripe Price ID
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Stripe publishable key (vain client)

3. **Migraatiot**
   ```bash
   npm run db:migrate
   ```

4. **Siemen-data (mallipohjat)**
   ```bash
   npm run db:seed
   ```

5. **Kehityspalvelin**
   ```bash
   npm run dev
   ```
   Kirjaudu `/login`-sivulla ja luo organisaatioprofiili `/onboarding`-sivulla, jos sitä pyydetään.

## Database & Auth Notes

- `users`, `sessions`, `organization_profiles`, `templates`, `drafts`, `audit_events` + indeksit löytyvät `src/db/schema.ts` sekä `drizzle/`.
- Salasanat → `bcryptjs`, kustannus 10. Session tokenit hashataan HMAC-SHA256:lla (`SESSION_SECRET`) ja tallennetaan vain hashina.
- Cookie `session` on HTTP-only, `sameSite=lax`, `secure` vain tuotannossa, ja sen ikä = 7 päivää.
- `/onboarding` + `/app/*` käyttävät `requireUser()`-apuria (ei middlewarea) ja ohjaavat kirjautumattomat `/login`-sivulle.
- `/app/new` listaa 8 suomalaista valmista tilannemallia (siemen-data), jokaisella oma lomakerakenne.
- `/app/new/[templateKey]` renderöi dynaamisen lomakkeen, kutsuu OpenAI Responses API:a palvelimelta ja tallentaa `drafts`-rivin + audit-logien.
- `/app/history` ja `/app/history/[id]` näyttävät generoidut vastaukset, ja yksityiskohtasivulla on *Copy to clipboard* -nappi.
- `/app/profile` sekä `/onboarding` hyödyntävät samaa profiililomaketta (teitittely, sävy, allekirjoitus).
- `/app/templates` näyttää luotujen mallien kuvaukset ja kentät.
- Kaikki OpenAI-kutsut tapahtuvat palvelimella (`src/lib/ai/generateReply.ts`), joten API-avainta ei koskaan vuodata selaimeen.
- Jokainen uusi käyttäjä saa automaattisesti **7 päivän ilmaisen kokeilun**. Kokeilun tila tallennetaan `users.trialStartedAt / trialEndsAt` -kenttiin. Banneri `/app`-näkymässä näyttää jäljellä olevat päivät. Kun kokeilu loppuu, generointipainike deaktivoi ja käyttäjää pyydetään päivittämään maksulliseen (14,99 €/kk) – taustapalvelin estää myös AI-kutsut.
- Tekoälyn käyttö vaatii vahvistetun sähköpostin. Vahvistuslinkki lähetetään rekisteröinnissä ja lokitetaan konsoliin, jos sähköpostin lähettäjää ei ole konfiguroitu.

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js with `next dev` |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate a new Drizzle migration from the schema |
| `npm run db:migrate` | Apply pending migrations to `dev.db` |
| `npm run db:seed` | Upsert 8 suomenkielistä mallipohjaa |

## Testing the Flow

1. Mene `/login`iin ja luo tunnus (tai kirjaudu). Onnistumisen jälkeen sinut ohjataan `/onboarding`iin.
2. Täytä organisaatioprofiili (yritys, teitittely, sävy, allekirjoitus) → `upsertOrganizationProfile`.
3. Valitse `/app/new` -sivulta tilannekortti ja täytä lomake. Server action kokoaa syötteen, hakee profiilin, kutsuu OpenAI Responses API:a ja tallentaa `drafts` + `audit_events`.
4. Sinut ohjataan `/app/history/[id]` -sivulle, josta voit kopioida luonnoksen ja nähdä käytetyn mallin.
5. `/app/history` listaa kaikki luonnokset, `/app/templates` näyttää pohjat ja `/app/profile` mahdollistaa tietojen päivittämisen.

## Maksullisuus

- Stripe Checkout + Billing Portal tukevat kuukausitilausta, kun avaimet on asetettu.

## Stripe webhook (dev)

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Kopioi `whsec_...` ja aseta se `STRIPE_WEBHOOK_SECRET`-arvoksi.

## Email verification (dev)

- Jos `SMTP_URL`/`EMAIL_FROM` ei ole määritelty, vahvistuslinkki tulostetaan konsoliin `DEV_EMAIL`-rivillä.
- Kehityksessä voit myös asettaa `DEV_EMAIL_VERIFICATION_MODE="link"` ja luoda linkin suoraan profiilisivulta (DEV).

## Turnstile (dev)

- Lisää Turnstile-avaimet `.env`: `TURNSTILE_SITE_KEY` ja `TURNSTILE_SECRET_KEY`.
- Jos avaimia ei ole, CAPTCHA ohitetaan kehityksessä ja kirjautumissivulla näytetään huomautus.

> **Muistutus:** OpenAI API -avainta ei saa koskaan käyttää selaimessa. Kaikki kutsut tehdään `src/lib/ai/generateReply.ts` -tiedoston kautta palvelinpuolella.
