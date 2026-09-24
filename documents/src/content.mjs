/* Wording for every Aura Films document. Matches the published Terms, Refund and Privacy
   policies on itsaurafilms.com; change both together. Field helpers:
   fl(label,name[,cls]) text box · ml(label,name,h) multi-line · ck(name,label) checkbox
   ini(name) initials box · sig(label,name) signature line */
const A = s => s.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
export const fl = (label, name, tip = '') => `<div class="fl"><label>${label}</label><span class="f" data-n="${name}" data-tip="${tip || label}"></span></div>`;
export const ml = (label, name, h = 60) => `<div class="fl"><label>${label}</label><span class="f m" style="height:${h}px" data-n="${name}" data-t="multi" data-tip="${label}"></span></div>`;
export const ck = (name, label) => `<span class="ck"><span class="fc" data-n="${name}" data-t="check" data-tip="${label}"></span>${label}</span>`;
export const cks = (prefix, labels) => `<div class="checks">${labels.map(l => ck(prefix + '_' + A(l), l)).join('')}</div>`;
export const ini = name => `<div class="ini"><span class="f" data-n="${name}" data-tip="Client initials"></span><small>Initials</small></div>`;
export const sig = (label, name) => `<div class="fl"><label>${label}</label><span class="f sig" data-n="${name}" data-t="sig" data-tip="${label}: type your full name to sign"></span></div>`;
const cl = (n, head, body, i) => `<div class="clause"><div><span class="n">${n}</span><b>${head}.</b> ${body}</div>${i ? ini('Initials_' + n) : '<div></div>'}</div>`;
const esign = pre => `<div class="box" style="margin-top:10px">${ck(pre + '_ESign_Consent', 'I agree to sign this document electronically. Typing my name in the signature box, or drawing my signature, has the same effect as signing by hand.')}</div>`;

/* ───────────── 01 · Photography Services Agreement ───────────── */
const agreement = {
  file: 'AF-01-Photography-Services-Agreement', code: 'AF-01', title: 'Photography Services Agreement',
  sub: 'Weddings · Events · Portraits · Family · Architecture',
  pages: [`
<div class="grid g3">${fl('Agreement no.', 'Agreement_No')}${fl('Date issued', 'Date_Issued')}${fl('Quote valid until', 'Quote_Valid_Until')}</div>
<p class="lede" style="margin-top:10px">This agreement is between <b>Aura Films</b>, a sole proprietorship operated by Albin in Kingston, Ontario ("Aura Films", "we"), and the client named below ("the Client", "you"). It confirms what we will photograph, what it costs, and what each of us has agreed to.</p>
<h2>The client</h2>
<div class="grid g2">${fl('Client full name', 'Client_Name')}${fl('Second client / partner (if any)', 'Client2_Name')}
${fl('Email', 'Client_Email')}${fl('Phone', 'Client_Phone')}</div>
<div class="grid" style="margin-top:7px">${fl('Mailing address', 'Client_Address')}</div>
<h2>The session</h2>
${cks('Type', ['Wedding', 'Event / shower', 'Portrait', 'Family / maternity', 'Architecture', 'Other'])}
<div class="grid g3">${fl('Package', 'Package')}${fl('Session date', 'Session_Date')}${fl('Start time', 'Start_Time')}
${fl('Hours of coverage', 'Hours')}${fl('Photographers', 'Photographers')}${fl('Edited images included', 'Images_Included')}</div>
<div class="grid g2" style="margin-top:7px">${fl('Main location / venue', 'Location_1')}${fl('Second location (if any)', 'Location_2')}</div>
<div class="grid g2" style="margin-top:7px">${fl('Delivery window (from session date)', 'Delivery_Window')}${fl('Extra time rate', 'Extra_Time_Rate', 'e.g. +$15 per extra 30 min, or +$150/hr')}</div>
<div class="grid" style="margin-top:7px">${ml('Add-ons and special requests', 'Addons', 44)}</div>
<h2>Fees (CAD)</h2>
<div class="grid g4">${fl('Package fee', 'Fee_Package')}${fl('Add-ons', 'Fee_Addons')}${fl('Travel', 'Fee_Travel')}${fl('Discount', 'Fee_Discount')}
${fl('HST (if applicable)', 'Fee_Tax')}${fl('Total fee', 'Fee_Total')}${fl('Retainer (30%)', 'Fee_Retainer')}${fl('Balance due', 'Fee_Balance')}</div>
<div class="grid g2" style="margin-top:7px">${fl('Balance due date', 'Balance_Due_Date', 'On or before the session date unless agreed otherwise')}${fl('Payment method', 'Payment_Method', 'Interac e-Transfer to itsaurafilms@gmail.com, cash, or card')}</div>
`, `
<h2>Terms</h2>
<p class="note" style="margin-bottom:9px">Please read each term. Where there is an initials box, add your initials to confirm you have read it.</p>
${cl(1, 'Booking and retainer', 'Your date is reserved only when we have <b>both</b> this signed agreement and the 30% retainer. The retainer is <b>non-refundable</b> if you cancel, because we turn away other work to hold your date, except where the law requires otherwise or as set out in clause 6.', 1)}
${cl(2, 'Balance', 'The balance is due on or before the session date unless we agree otherwise in writing. Final images are released once the balance is paid in full. All prices are in Canadian dollars. Quotes are valid for 30 days.', 0)}
${cl(3, 'Extra time', 'Coverage beyond the hours booked is added only if you ask for it and we are available, at the extra time rate shown on page 1. It is payable with the balance.', 0)}
${cl(4, 'If you cancel', 'You may cancel at any time by written notice (email is fine). The retainer is kept; anything you paid above the retainer is refunded. If you cancel within <b>7 days</b> of the session, the full fee may remain payable, as the date can rarely be rebooked at short notice.', 1)}
${cl(5, 'Rescheduling', 'You may reschedule once with reasonable notice, subject to availability, and your retainer carries over. Further changes may carry a small administration fee. Outdoor sessions moved because of unsafe weather are always rescheduled free of charge.', 0)}
${cl(6, 'If we cancel', 'If Aura Films must cancel and we cannot agree an alternative date or, with your agreement, a suitable replacement photographer, you receive a <b>full refund of everything you paid, including the retainer</b>.', 0)}
${cl(7, 'Late arrival and no-show', 'Time missed through late arrival is not refunded or added on. A no-show without notice is treated as a cancellation under clause 4.', 0)}
${cl(8, 'The finished work', 'We deliver hand-graded, high-resolution images in our editing style within the delivery window above. We choose which frames to deliver using our professional judgement; the number stated is what you receive. Unedited raw files are not included unless purchased. Every image is a photograph taken by Aura Films: we do not create images with AI. Refunds are not given for differences in personal taste; if a delivered image has a genuine technical fault we will re-edit it or, where reasonably possible, reshoot.', 0)}
${cl(9, 'Copyright and your licence', 'Aura Films owns the copyright in all images under the Canadian <i>Copyright Act</i>. Once paid in full, you receive a personal, non-exclusive, non-transferable licence to print and share the images for personal, non-commercial use, with credit to @aura.filmsca where practical. Commercial use, resale, editing or applying filters, or entering images in contests needs our written permission. Architecture and business clients receive the licence stated in their package.', 1)}
${cl(10, 'Our use of images', 'We use images in which you or your guests can be identified for our portfolio, website or social media <b>only</b> with the permission given in the separate Model &amp; Image Release (AF-02). Images of children are never used without a parent or guardian’s written consent.', 1)}
${cl(11, 'On the day', 'You will provide a safe working environment and tell us about venue rules in advance. We are not responsible for shots missed because of venue restrictions, guests’ cameras or phones in the aisle, weather, or timeline changes outside our control. For coverage over 5 hours, a short meal break is appreciated. We may end a session, without refund, if the safety of our team or equipment is at risk.', 0)}
`, `
${cl(12, 'Storage and backups', 'Your online gallery stays available for at least 12 months after delivery. Please download and back up your images; after that period we may delete them without further notice.', 0)}
${cl(13, 'Events outside our control', 'Neither of us is responsible for failing to perform because of events beyond reasonable control, such as serious illness, extreme weather, emergencies or equipment failure. We will make reasonable efforts to reschedule or arrange a suitable substitute; if that is not possible, clause 6 applies.', 0)}
${cl(14, 'Limit of liability', 'If we are unable to deliver, in whole or part, our total liability is limited to a refund of the fees you paid for the affected service. We are not liable for indirect or consequential losses. Nothing in this agreement limits liability that cannot be limited by law.', 1)}
${cl(15, 'Privacy', 'We handle your personal information under our Privacy Policy and PIPEDA, and use it only to deliver this service.', 0)}
${cl(16, 'If something goes wrong', 'Tell us in writing first at itsaurafilms@gmail.com; we reply within 5 business days and will try to resolve it with you directly. If that does not settle things, we are both willing to try mediation in Kingston, Ontario, each paying our own share. Either of us may then go to court. <b>Nothing here removes any right you have under Ontario or Canadian consumer-protection law.</b> Please contact us before raising a chargeback.', 0)}
${cl(17, 'The whole agreement', 'This agreement, with our published Terms &amp; Conditions and Refund &amp; Cancellation Policy, is the whole agreement between us. Changes must be in writing (email is fine). It is governed by the laws of Ontario and of Canada. It may be signed electronically and in separate copies, which together form one agreement.', 0)}
<h2>Signatures</h2>
${esign('Client')}
<div class="grid g3" style="margin-top:12px">${sig('Client signature', 'Client_Signature')}${fl('Printed name', 'Client_Print_Name')}${fl('Date', 'Client_Sign_Date')}</div>
<div class="grid g3" style="margin-top:12px">${sig('Second client signature (if any)', 'Client2_Signature')}${fl('Printed name', 'Client2_Print_Name')}${fl('Date', 'Client2_Sign_Date')}</div>
<div class="grid g3" style="margin-top:12px">${sig('For Aura Films', 'AF_Signature')}${fl('Name', 'AF_Print_Name')}${fl('Date', 'AF_Sign_Date')}</div>
<p class="note" style="margin-top:14px">How to sign: open this PDF in Adobe Acrobat Reader (free), Apple Preview or Microsoft Edge, fill in the boxes, tick the e-signature consent, type or draw your signature, save, and email it back to itsaurafilms@gmail.com. Keep a copy for your records.</p>
`]
};

/* ───────────── 02 · Model & Image Release ───────────── */
const release = {
  file: 'AF-02-Model-and-Image-Release', code: 'AF-02', title: 'Model &amp; Image Release',
  sub: 'Your permission for how Aura Films may share your photographs',
  pages: [`
<p class="lede">This release is optional and separate from your booking: saying no, or choosing only some uses, never affects your session or your images. You can withdraw permission for future use at any time by emailing itsaurafilms@gmail.com, and we will stop any new use and remove the images from our website.</p>
<h2>Who this covers</h2>
<div class="grid g2">${fl('Your full name', 'Model_Name')}${fl('Session date', 'Session_Date')}
${fl('Email', 'Model_Email')}${fl('Phone', 'Model_Phone')}</div>
<div class="grid" style="margin-top:7px">${fl('Other adults in the photos who also agree (names)', 'Other_Adults')}</div>
<h2>Where Aura Films may use your photos</h2>
<p>Tick every use you are happy with. Anything left unticked is <b>not</b> permitted.</p>
<div class="box">
<div class="checks" style="flex-direction:column;gap:7px">
${ck('Use_Website', 'Aura Films website and online portfolio')}
${ck('Use_Social', 'Aura Films Instagram, Facebook and other social media')}
${ck('Use_Tag', 'You may tag or name me in social posts')}
${ck('Use_Print', 'Printed marketing: brochures, albums shown to clients, displays')}
${ck('Use_Ads', 'Paid advertising (for example Google or Meta ads)')}
${ck('Use_Publish', 'Submission to publications, blogs and photography awards')}
${ck('Use_None', 'None of the above: keep my images private')}
</div></div>
<div class="grid" style="margin-top:8px">${ml('Anything we should not show? (for example certain photos, faces, or locations)', 'Restrictions', 46)}</div>
<h2>What you are agreeing to</h2>
<ul class="plain">
<li>Aura Films may use the images you ticked above, without payment to you, to show and promote its photography.</li>
<li>Images may be cropped, colour graded and retouched in our normal editing style, but will not be altered to misrepresent you, and will never be used with AI to create new images of you.</li>
<li>We will not sell your images to third parties or license them for anyone else’s advertising.</li>
<li>We will not publish your address or contact details alongside your photos.</li>
<li>Withdrawing permission stops new use from the date we receive your email. Printed items already produced and posts shared by others may take time to remove.</li>
</ul>
`, `
<h2>Children in the photos (a parent or guardian must complete)</h2>
<p>Images of anyone under 18 are used <b>only</b> with this written consent. First names only will ever be used, and never with a location or school.</p>
<div class="grid g2">${fl('Child’s name(s)', 'Child_Names')}${fl('Age(s)', 'Child_Ages')}</div>
<div class="grid g3" style="margin-top:8px">${sig('Parent / guardian signature', 'Guardian_Signature')}${fl('Printed name', 'Guardian_Print_Name')}${fl('Date', 'Guardian_Sign_Date')}</div>
<div class="grid" style="margin-top:7px">${fl('Relationship to child', 'Guardian_Relationship')}</div>
<h2>Signatures</h2>
${esign('Model')}
<div class="grid g3" style="margin-top:12px">${sig('Your signature', 'Model_Signature')}${fl('Printed name', 'Model_Print_Name')}${fl('Date', 'Model_Sign_Date')}</div>
<div class="grid g3" style="margin-top:12px">${sig('For Aura Films', 'AF_Signature')}${fl('Name', 'AF_Print_Name')}${fl('Date', 'AF_Sign_Date')}</div>
<p class="note" style="margin-top:14px">Questions, or want to change your choices later? Email itsaurafilms@gmail.com or call 343 989 4546. Our Privacy Policy is at itsaurafilms.com/privacy.</p>
`]
};

/* ───────────── 03 · Invoice ───────────── */
const rows = n => Array.from({ length: n }, (_, i) => `<tr><td style="width:52%"><span class="f" data-n="Item_${i + 1}_Desc" data-tip="Description"></span></td><td><span class="f" data-n="Item_${i + 1}_Qty" data-tip="Quantity"></span></td><td><span class="f" data-n="Item_${i + 1}_Rate" data-tip="Rate"></span></td><td><span class="f" data-n="Item_${i + 1}_Amount" data-tip="Amount"></span></td></tr>`).join('');
const tot = (label, name, big) => `<div class="r${big ? ' big' : ''}"><span>${label}</span><span class="f" data-n="${name}" data-tip="${label}"></span></div>`;
const invoice = {
  file: 'AF-03-Invoice', code: 'AF-03', title: 'Invoice', sub: 'All amounts in Canadian dollars (CAD)',
  pages: [`
<div class="cols">
<div class="grid">${fl('Bill to', 'Bill_To_Name')}${fl('Email', 'Bill_To_Email')}${fl('Address', 'Bill_To_Address')}</div>
<div class="grid g2">${fl('Invoice no.', 'Invoice_No')}${fl('Invoice date', 'Invoice_Date')}${fl('Due date', 'Due_Date')}${fl('Agreement no.', 'Agreement_No')}${fl('Session date', 'Session_Date')}${fl('HST no. (if registered)', 'HST_No')}</div>
</div>
<h2>Details</h2>
<table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows(8)}</tbody></table>
<div class="tot">${tot('Subtotal', 'Subtotal')}${tot('Discount / offer code', 'Discount')}${tot('HST 13% (if applicable)', 'Tax')}${tot('Total', 'Total', 1)}${tot('Paid to date (incl. retainer)', 'Paid_To_Date')}${tot('Balance due', 'Balance_Due', 1)}</div>
<h2>How to pay</h2>
<div class="cols">
<div><p><b>Interac e-Transfer</b> to itsaurafilms@gmail.com. Please put the invoice number in the message.</p><p>Cash or card are also welcome in person.</p></div>
<div class="note"><p>The 30% retainer reserves your date and is non-refundable if you cancel. The balance is due on or before your session date unless agreed otherwise. Final images are released once paid in full. Full terms: itsaurafilms.com/terms and /refund.</p></div>
</div>
<div class="grid" style="margin-top:6px">${ml('Notes', 'Notes', 40)}</div>
<p style="margin-top:14px;font-family:Clash;font-weight:500;font-size:13px">Thank you for choosing Aura Films.</p>
`]
};

/* ───────────── 04 · Payment Receipt ───────────── */
const receipt = {
  file: 'AF-04-Payment-Receipt', code: 'AF-04', title: 'Payment Receipt', sub: 'Proof of payment · keep for your records',
  pages: [`<div class="stamp">PAID</div>
<div class="grid g3" style="width:62%">${fl('Receipt no.', 'Receipt_No')}${fl('Date received', 'Date_Received')}${fl('Invoice no.', 'Invoice_No')}</div>
<h2>Received from</h2>
<div class="grid g2">${fl('Name', 'Payer_Name')}${fl('Email', 'Payer_Email')}</div>
<h2>Payment</h2>
<div class="grid g3">${fl('Amount received (CAD)', 'Amount')}${fl('Session date', 'Session_Date')}${fl('Reference / e-Transfer ID', 'Reference')}</div>
<p style="margin-top:9px">Method</p>${cks('Method', ['Interac e-Transfer', 'Cash', 'Credit / debit card', 'Other'])}
<p>This payment is for</p>${cks('For', ['30% retainer', 'Balance', 'Add-ons / extra time', 'Full payment'])}
<div class="tot" style="margin-left:0;width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
${fl('Total fee', 'Total_Fee')}${fl('Paid to date', 'Paid_To_Date')}${fl('Balance remaining', 'Balance_Remaining')}</div>
<div class="grid" style="margin-top:9px">${fl('Description', 'Description')}</div>
<div class="grid g2" style="margin-top:18px">${sig('Received by, for Aura Films', 'AF_Signature')}${fl('Date', 'AF_Sign_Date')}</div>
<p class="note" style="margin-top:14px">Retainers are non-refundable if the client cancels; see itsaurafilms.com/refund. Approved refunds are made to the original payment method within 14 days.</p>
`]
};

/* ───────────── 05 · Client Questionnaire ───────────── */
const questionnaire = {
  file: 'AF-05-Client-Questionnaire', code: 'AF-05', title: 'Client Questionnaire', sub: 'Help us plan your session · return a week before',
  pages: [`
<div class="grid g3">${fl('Your name', 'Name')}${fl('Session date', 'Session_Date')}${fl('Best phone on the day', 'Phone_Day')}</div>
<h2>The session</h2>
<div class="grid g2">${fl('Location(s) and address', 'Locations')}${fl('Start and finish time', 'Times')}</div>
<div class="grid" style="margin-top:7px">${ml('Timeline for the day (arrival, ceremony, speeches, cake, sunset, etc.)', 'Timeline', 90)}</div>
<h2>The people</h2>
<div class="grid g2">${ml('Who will be photographed? (names and relationship)', 'People', 64)}${ml('Key people we must capture, and any family group photos', 'Groups', 64)}</div>
<div class="grid g2" style="margin-top:7px">${fl('On-the-day contact (not you) and phone', 'Day_Contact')}${fl('Pets, children or anyone needing extra care', 'Care')}</div>
<h2>Your style</h2>
${cks('Style', ['Candid and natural', 'Posed and classic', 'Editorial', 'Warm and film-like', 'Bright and clean', 'Moody'])}
<div class="grid g2">${ml('Must-have shots or moments', 'Must_Have', 70)}${ml('Anything to avoid (angles, topics, people who should not be photographed together)', 'Avoid', 70)}</div>
<div class="grid g2" style="margin-top:7px">${fl('Instagram or Pinterest links you love', 'Inspiration')}${fl('Outfits / number of looks', 'Outfits')}</div>
<h2>Good to know</h2>
<div class="grid g2">${ml('Accessibility needs, allergies, cultural or religious customs', 'Needs', 50)}${ml('Venue rules (flash, drones, restricted areas), parking', 'Venue_Rules', 50)}</div>
<p class="note" style="margin-top:10px">Email the completed form to itsaurafilms@gmail.com. Anything you are unsure about, leave blank and we will talk it through.</p>
`]
};

/* ───────────── 06 · Booking checklist (internal) ───────────── */
const step = (n, head, items) => `<div class="clause" style="grid-template-columns:1fr 40px"><div><span class="n">${n}</span><b>${head}</b><ul class="plain" style="margin-top:3px">${items.map(i => `<li>${i}</li>`).join('')}</ul></div>${`<div class="ini"><span class="f" style="width:22px" data-n="Done_${n}" data-t="check" data-tip="Done"></span><small>Done</small></div>`}</div>`;
const checklist = {
  file: 'AF-06-Booking-Checklist', code: 'AF-06', title: 'Booking Checklist', sub: 'Internal · from first enquiry to final gallery',
  pages: [`
<div class="grid g3">${fl('Client', 'Client')}${fl('Session date', 'Session_Date')}${fl('Package', 'Package')}</div>
<div style="margin-top:12px"></div>
${step(1, 'Reply to the enquiry within a few hours', ['Confirm the date is free; suggest the best-fit package', 'Answer questions; offer a 15-minute call', 'Log the lead: name, date, source (Instagram, Google, referral)'])}
${step(2, 'Send the quote', ['Package, extras, travel, any offer code', 'State that quotes are valid 30 days'])}
${step(3, 'Send AF-01 Agreement and AF-02 Release', ['Fill page 1 (fees, date, package) before sending', 'Client returns signed PDFs by email; save both to the client folder'])}
${step(4, 'Collect the 30% retainer (AF-03 Invoice)', ['Date is held only when signature and retainer are both in', 'Send AF-04 Receipt the same day; block the date in your calendar'])}
${step(5, 'Two weeks before', ['Send AF-05 Questionnaire; confirm timeline, locations, weather plan', 'Invoice the balance (due on or before the session date)'])}
${step(6, 'Two days before', ['Confirm start time and meeting point by text', 'Charge batteries, format cards, check backups and weather'])}
${step(7, 'Session day', ['Arrive 15 minutes early; back up cards the same night to two places'])}
${step(8, 'After the session', ['Send a 3 to 5 photo sneak peek within 48 hours', 'Deliver the full gallery within the agreed window', 'Receipt for the balance; post only images the Release allows'])}
${step(9, 'Follow up', ['Ask for a Google review one week after delivery', 'Add to the mailing list only if they opted in', 'Anniversary or seasonal message in a year'])}
`]
};

export const DOCS = [agreement, release, invoice, receipt, questionnaire, checklist];
