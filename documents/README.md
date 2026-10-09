# Aura Films business documents

Fillable, branded PDFs. Open in Adobe Acrobat Reader (free), Apple Preview or Microsoft Edge.

| File | Who fills it | Signed? |
|---|---|---|
| AF-01 Photography Services Agreement | You fill page 1, client signs page 3 and initials 5 clauses | Yes |
| AF-02 Model & Image Release | Client (parent/guardian for children) | Yes |
| AF-03 Invoice | You | No |
| AF-04 Payment Receipt | You, each time money comes in | Your signature |
| AF-05 Client Questionnaire | Client, a week before the session | No |
| AF-06 Booking Checklist | You (internal, never send) | No |

## Sending a contract for e-signature
1. Open AF-01, fill page 1 (agreement no., date, package, fees), save as `AF-01 <Client> <date>.pdf`.
2. Email it with AF-02 to the client. They fill, tick the e-signature box, type or draw their signature, save, and email it back.
3. Sign the Aura Films line on the returned copy, save it to the client folder and send them the final copy.

For a signing link with an audit trail (who signed, when, from which email), upload the same PDF to an e-signature service instead; the fields carry over.

## Editing the wording
Text lives in `src/content.mjs`; layout in `src/build.mjs`. Rebuild with:
```
CHROME_PATH=/path/to/chrome node documents/src/build.mjs   # CHROME_PATH optional on a normal PC
```
Keep the agreement in step with the Terms and Refund pages in `redesign/gen.mjs`.

These templates are not legal advice. Have an Ontario lawyer or paralegal review AF-01 and AF-02 before first use.
