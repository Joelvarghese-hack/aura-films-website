# Aura Films SEO playbook (October 2026)

Your half of the SEO work. Everything here is ready to copy and paste.
Not served on the website (`/seo/*` redirects home).

---

## 1. Google Business Profile (do this first, about 30 minutes)

The single biggest local-search lever. Go to business.google.com and sign in as itsaurafilms@gmail.com.

**Business name:** Aura Films (exactly this; adding keywords to the name breaks Google's rules)
**Primary category:** Wedding Photographer
**Additional categories:** Photographer · Portrait Studio · Event Photographer · Commercial Photographer
**Service area (no storefront):** Kingston, Gananoque, Napanee, Belleville, Brockville, Prince Edward County, Ottawa
**Phone:** 343 989 4546 · **Website:** https://itsaurafilms.com
**Hours:** whatever you actually answer enquiries

**Description (734 characters, under the 750 limit, paste as-is):**
> Aura Films is a Kingston, Ontario photography studio run by Albin, who photographs every session himself and edits every frame by hand. We photograph weddings, engagements, portraits, family and maternity sessions, newborns, baby showers, birthdays, corporate events and architecture, in Kingston and anywhere in Ontario. Prices are published openly: portraits from $85, family sessions from $179, events from $399 and weddings from $1,195, with two photographers on our larger wedding packages. Galleries are delivered in 10 to 21 days with a print release, and wedding couples get a sneak peek within the first week. Travel within an hour of Kingston is included. Every image is a real photograph; we never use AI-generated imagery.

**Services (add each with its price):** Wedding photography from $1,195 · Engagement session $325 · Portrait session from $85 · Family & maternity session from $179 · Event photography from $399 · Architectural photography from $750

**Photos:** upload 15–25 of your best real photographs, plus 2–3 of Albin working. Add 3–5 new ones every month; profiles that stay active tend to do better. [Medium confidence: this is common practice; Google doesn't publish the exact effect.]

**Reviews:** the most important ongoing task. After each gallery delivery, send:
> Hi [name], I hope you're loving the photos! If you have two minutes, a Google review helps other couples find us more than anything else: [your review link]. Thank you so much. Albin

Reply to every review, mentioning the type of session and the place ("Thank you, it was a joy photographing your engagement at City Park").

**Also claim (same details, 10 minutes each):** Bing Places (can import from Google) · Apple Business Connect · Facebook page · Instagram business profile linking to the site.

Use the **same name, phone and website everywhere**. Mismatches confuse Google.

---

## 2. Google Search Console (15 minutes, then check monthly)

This is how you see which searches show your site, your position and your clicks.

1. Go to search.google.com/search-console and add a **Domain** property: `itsaurafilms.com`.
2. Google gives you a TXT record. Add it in Cloudflare → DNS → Add record → Type TXT, Name `@`, paste the value. (Or send it to me and I'll add it.)
3. Once verified: Sitemaps → submit `https://itsaurafilms.com/sitemap.xml`.
4. URL Inspection → request indexing for `/weddings`, `/portraits` and `/events` after they go live.
5. Repeat at bing.com/webmasters (it can import from Search Console in one click).

**Monthly check (the "striking distance" method):** in Performance, filter for queries where your average position is 4–15. Those are the ones closest to page 1; one improvement to the matching page often moves them.

---

## 3. Links from people who already know you

The test is: would this link exist if Google didn't? Venues and vendors you've worked with are the best links you can get.

**Venue / vendor email (send after each wedding):**
> Subject: Photos from [couple]'s wedding at [venue]
>
> Hi [name],
>
> I photographed [couple]'s wedding at [venue] on [date] and wanted to share a few of my favourite images of the space. You're welcome to use them on your website or social media, with a credit to Aura Films (itsaurafilms.com).
>
> If you keep a list of photographers you recommend, I'd love to be considered.
>
> Thanks for making the day so easy,
> Albin
> Aura Films · 343 989 4546

Send the same email to the florist, the planner, the DJ and the hair and makeup artist from each wedding. Each one is a chance for a link and a referral.

**Directories worth being on** (they rank on page 1 for "Kingston wedding photographer" today):
WeddingWire.ca · WPJA · Fearless Photographers (paid, judge the cost) · Kingston/1000 Islands tourism or wedding listings if you qualify.

**Avoid:** buying links, "high DA" link packages, PBNs, comment spam and mass press releases.

---

## 4. Stories only you can tell (send these to me)

This is what makes pages rank and get quoted by AI search. For each of 3–5 recent sessions, answer in a few lines (voice notes are fine):

1. Who, what kind of session, where exactly (venue, park, street)?
2. What was the light or the weather like, and what did you do about it?
3. One thing that went wrong or surprised you, and how you handled it.
4. The photo you're proudest of, and why.
5. A practical tip for the next couple or family shooting there.
6. Did the client agree to be featured? (Check their AF-02 release.)

I'll turn each one into a blog post or a section of the matching town page. This also fixes the town pages, which are currently near-identical templates.

**Numbers you could share (only if real):** average hours couples book · how far ahead people book · most-booked month · average photos delivered vs promised.

---

## 5. 90-day plan

| When | You | Me |
|---|---|---|
| Week 1 | Google Business Profile, Search Console, Bing, Apple | Weddings/Portraits/Events hubs live, titles, schema |
| Weeks 2–4 | Ask the last 5 clients for reviews; send 3 vendor emails | Turn your stories into 2 posts plus 1 town page rewrite |
| Month 2 | Post 3–5 new photos to Google each month | Venue guide: "Best places for wedding photos in Kingston" |
| Month 3 | Check Search Console striking-distance queries | Improve the pages closest to page 1 |

**Measure monthly:** Google reviews count · Search Console clicks and impressions · enquiries (GA4 `booking_intent`, `call_click`, `email_click`) · position for "Kingston wedding photographer".

---

## Things I noticed but didn't change (your call)

- The add-ons list on the Investment page sells "Raw / unedited files $150", but the FAQ says RAW files aren't given. Pick one answer.
- Links inside paragraphs on the new hub pages use the site's paragraph style, so they're hard to spot. A light underline would help.
- `/faq` title "Questions, Answered · Aura Films" could become "Photography FAQ: Booking, Prices & Travel · Aura Films". I didn't touch it because it's your recent page.
- The six town pages share one template. Adding a real shoot to each is the biggest content win (see section 4).
