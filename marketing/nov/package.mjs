/* Builds the November 2026 delivery folder + zip from rendered output.
   node marketing/nov/package.mjs */
import { mkdirSync, writeFileSync, copyFileSync, existsSync, rmSync, readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { DAYS } from './content.mjs';

const NOV = process.cwd() + '/marketing/nov', PKG = NOV + '/Aura-Films-November-2026';
const plan = JSON.parse(readFileSync(NOV + '/plan.json', 'utf8'));
const tag = d => `nov-${String(d).padStart(2, '0')}`;
const date = d => new Date(Date.UTC(2026, 10, d)).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const TAGS = {
  Wedding: '#kingstonweddingphotographer #ontarioweddingphotographer #kingstonwedding #ygkwedding',
  Engage: '#kingstonengagement #ontarioengagementphotographer #justengaged #ygk',
  Family: '#kingstonfamilyphotographer #ygkfamily #familyphotography #kingstonontario',
  Portrait: '#kingstonportraits #ygkphotographer #portraitphotography #kingstonontario',
  Event: '#kingstoneventphotographer #ygkevents #eventphotography #kingstonontario',
  Default: '#kingstonphotographer #ygk #kingstonontario #ontariophotographer',
};
const tags = t => {
  const k = /Wedding|Sneak|Gallery|Look closer|Quote: Wedding/i.test(t) ? 'Wedding' : /Engage|Couple/i.test(t) ? 'Engage'
    : /Family|Maternity|Newborn|Holiday|Poll|old photos/i.test(t) ? 'Family' : /Portrait|Corporate|headshot/i.test(t) ? 'Portrait' : /Event/i.test(t) ? 'Event' : 'Default';
  return TAGS[k] + ' #aurafilms';
};
const TRACK = {
  Bubbles: ['Bubbles', 'Public Domain Lofi', 'https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/'],
  Extra_Life_I_Never_Used: ['Extra Life I Never Used', 'We Drove All Night (Game Soundtrack)', 'https://freemusicarchive.org/music/holiznacc0/we-drove-all-night-game-soundtrack/'],
  Skill_Test: ['Skill Test', 'After Dark', 'https://freemusicarchive.org/music/holiznacc0/after-dark/'],
  Spring_In_Sight: ['Spring In Sight', 'Spring Woke Me Up', 'https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/'],
  Toy_Box: ['Toy Box', 'Spring Woke Me Up', 'https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/'],
  Feeling_Human_Again: ['Feeling Human Again', 'Spring Woke Me Up', 'https://freemusicarchive.org/music/holiznacc0/spring-woke-me-up/'],
};

rmSync(PKG, { recursive: true, force: true });
for (const d of ['posters', 'videos', 'captions']) mkdirSync(`${PKG}/${d}`, { recursive: true });
const csv = [['day', 'date', 'theme', 'poster', 'video', 'music', 'dm_keyword', 'caption', 'hashtags']];
let md = '# Aura Films · November 2026 captions\n\nOne poster and one Story video per day. Post the video as a Story; the poster works as a Story or a feed post. Captions have no prices by design.\n\n';
for (const x of DAYS) {
  const p = plan.find(q => q.day === x.d), t = TRACK[p.track];
  for (const [src, dst] of [[`${NOV}/out/posters/${tag(x.d)}-poster.jpg`, `${PKG}/posters/${tag(x.d)}-poster.jpg`], [`${NOV}/out/videos/${tag(x.d)}-story.mp4`, `${PKG}/videos/${tag(x.d)}-story.mp4`]]) {
    if (!existsSync(src)) throw new Error('missing ' + src); copyFileSync(src, dst);
  }
  csv.push([x.d, date(x.d), x.theme, `posters/${tag(x.d)}-poster.jpg`, `videos/${tag(x.d)}-story.mp4`, `${t[0]} by HoliznaCC0 (CC0)`, x.kw || '', x.cap, tags(x.theme)]);
  md += `## ${date(x.d)} · Day ${x.d} · ${x.theme}\n\n${x.cap}\n\n${tags(x.theme)}\n\n` + (x.kw ? `DM keyword: **${x.kw}** · ` : '') + `Music: ${t[0]} (HoliznaCC0)` + (x.poll ? ` · Story poll sticker: “${x.poll[0]}” / “${x.poll[1]}”` : '') + '\n\n';
}
writeFileSync(`${PKG}/captions/schedule.csv`, csv.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');
writeFileSync(`${PKG}/captions/captions.md`, md);

const used = [...new Set(plan.map(p => p.track))];
writeFileSync(`${PKG}/SOURCES.md`, `# Sources and licences

## Music (CC0, no copyright claims, no attribution required)
All tracks are by **HoliznaCC0**, released under Creative Commons CC0 1.0 (public domain dedication), as stated on each album page on the Free Music Archive (checked live 26 Oct 2026). Credit is given here as a courtesy.

${used.map(k => `- ${TRACK[k][0]} · album *${TRACK[k][1]}* · ${TRACK[k][2]}`).join('\n')}

Licence: https://creativecommons.org/publicdomain/zero/1.0/

Each video uses a 15-second excerpt from the most energetic part of its track, with a short fade in and out, normalised to -14 LUFS (Instagram's loudness).

Note: Instagram's music detection can occasionally flag CC0 tracks that someone else has registered. If a Story is muted or flagged, dispute it with the FMA link above, or swap the audio for a track from Instagram's own library.

## Fonts (Fontshare, free for commercial use under the ITF Free Font Licence)
Tanker, Nippo, Supreme, Chillax, Melodrama, Gambetta, Boska, Stardom, Bonny, Switzer, Satoshi, Ranade. https://www.fontshare.com

## Copy inspiration (ideas and formats only; every line was written fresh for Aura Films)
- Alina Thomas, *Social media captions for photographers*: https://www.alinathomas.com/social-media-captions (just booked, sneak peek, behind the scenes, gallery delivery formats)
- ShootDotEdit, *100 Instagram captions for wedding photographers*: https://shootdotedit.com/blogs/news/100-instagram-captions-for-wedding-photographers/
- Animoto, *Instagram Story ideas for photographers*: https://animoto.com/blog/video-ideas/instagram-stories-photographers-tips-inspiration (sneak peek, behind the scenes, polls, quotes, favourite location, get personal)
- EditingLive, *Family photo captions for Instagram*: https://editinglive.com/family-photo-captions-for-instagram/
- Cloudspot blog (photographer marketing): https://cloudspot.io/blog/

## Photographs
All photographs are Aura Films' own work, taken from the website's image library.
`);
writeFileSync(`${PKG}/README.txt`, `Aura Films · November 2026 social kit

posters/   30 Story posters, 1080x1920 JPG (nov-01 ... nov-30)
videos/    30 Story videos, 1080x1920, 15 s, H.264 + AAC music
captions/  schedule.csv (date, theme, files, caption, hashtags, DM keyword) and captions.md
SOURCES.md music licence (CC0), font licence, copy inspiration links

No prices appear anywhere in this kit. Holiday Minis posts say "coming soon / DM HOLIDAY": add dates once Albin confirms them.
`);
rmSync(`${NOV}/Aura-Films-November-2026.zip`, { force: true });
execFileSync('zip', ['-rq', 'Aura-Films-November-2026.zip', 'Aura-Films-November-2026'], { cwd: NOV });
console.log('packaged', PKG);
