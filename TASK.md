# TASK — Questionnaire v2: Eren QC fixes ROUND 2

All six round-1 fixes verified as genuinely fixed. One blocker remains, created by the
H1 fix. Plus six smaller defects found in round 2. Fix all of these.

## SCOPE — the only files you may touch

```
app/client/media-buying-clinic-questionnaire.tsx
lib/client-questionnaire.ts
app/api/client-questionnaire/route.ts
```

**`route.ts` is in scope for C3 ONLY** — the server has the same bug (see C3), and
fixing the client alone is not enough because the API would still 400 the submission.
Change nothing else in that file.

## EXPLICITLY OUT OF SCOPE
- Everything else. No auth files, no API routes, no pages, no other questionnaires.
- No deletions of files. No deploys.
- Do NOT reintroduce any test-password / auth bypass anywhere.

---

### C3 — BLOCKER: "No" to hasRunAds makes the form unsubmittable

`REQUIRED_BY_STEP.previousAds` contains `previousAds.unhappyAbout`.
When the client answers "No" to `hasRunAds`:
- `clearPreviousAdsAnswers` zeroes `unhappyAbout` to `""`
- the "No" branch does not render that field at all
- but it is still in the required list

Result: `isStepValid("previousAds")` is permanently false. Continue will not advance,
the sidebar will not navigate, and Submit bounces them back to a step whose required
field does not exist on screen. Every first-time advertiser — a big share of new clinic
clients — is locked out.

Fix: in `activeRequired()`, when the step is `previousAds` and
`payload.previousAds.hasRunAds === "No"`, return only `["previousAds.hasRunAds"]`.
When the answer is "Yes", return the full list as today.

Also the SERVER has the same bug and you must fix it: in
`app/api/client-questionnaire/route.ts`, `unhappyAbout` is pushed into `v2Required`
unconditionally (line ~279). A "No" submission therefore gets a 400 even with the UI
fixed. Wrap that entry: only require `unhappyAbout` when the clinic did NOT answer "No"
— i.e. `if (trim(clinic.previousAds?.hasRunAds) !== "No") { v2Required.push([...]) }`.
Change nothing else in that file.

---

### M3 — Cannot navigate to an earlier completed step while the current one is invalid

`jumpToStep` blocks ALL navigation when the current step is invalid, including going
*back* to a step they already completed to look something up.

Fix: allow navigation to a step whose index is LOWER than the current index regardless
of validity. Only block forward jumps past an invalid step.

---

### M4 — Submit does not check for in-flight uploads

If the client picks a large video and taps Submit while it is still uploading, the
brief submits without the asset.

Fix: at the top of `handleSubmit`, `if (uploading) return;` and show:
`Please wait — your file is still uploading.`

---

### L4 — Dead constant

`ACCESS_STEP_PREFIX` is declared and never used. Remove it.

---

### L5 — Autosave/submit race

If the autosave timer callback is already past its `submittingRef` check and awaiting
its fetch when submit starts, two concurrent POSTs land.

Fix: set `submittingRef.current = true` BEFORE `window.clearTimeout(saveTimerRef.current)`
in `handleSubmit`, and keep the in-callback guard.

---

### L6 — Required-field legend missing in monthly phase

The line "Fields marked * are required." only renders in the setup phase. The monthly
phase first step also has required fields.

Fix: render that legend on the first step of whichever phase is active.

---

### L7 — Upload error bleeds between upload targets

`uploadError` is shared. A failed `reports` upload leaves its error banner visible when
the user scrolls to `brandFiles`.

Fix: clear `uploadError` at the start of every upload attempt (already done) AND key the
error by target so it only renders under the uploader that produced it. Simplest correct
approach: `uploadError` becomes `{ target: "reports" | "brandFiles", message: string } | null`.

---

### L8 — No visual error state on access checkboxes

`aria-invalid` is set but there is no visible border change, so a client on a phone
cannot see which box is missing.

Fix: when the checklist-level error is showing, give un-ticked checkboxes a red border
(`border-red-500/50`). Keep the existing green border for ticked ones.

---

## Verification required

1. `npx tsc --noEmit` — paste the tail.
2. `npm run build` — paste the tail.
3. State plainly, by reading your code, how C3 is now resolved for a "No" answer.
4. **Do NOT claim browser verification.** You have no way to log in without the bypass
   and you must not add one. Say "not browser-tested" in your report.

## Report back
Each fix with its location. The tsc and build tails. Then, explicitly, whether the API
route would still reject a "No" submission (per the C3 note) — report only, do not edit.
