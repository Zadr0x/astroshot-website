# TASK — Questionnaire v2: Eren QC fixes (round 1)

Eren (Opus) reviewed your v2 build. Verdict: DO NOT SHIP. Six real defects.
The core mechanics passed — validation gating, checkbox enforcement, draft merge,
and the api route validation all reviewed clean. These are the remaining fixes.

## SCOPE — the only files you may touch

```
app/client/media-buying-clinic-questionnaire.tsx
lib/client-questionnaire.ts
```

## EXPLICITLY OUT OF SCOPE
- Everything else. Do not touch `lib/client-portal-auth.ts`, `next-env.d.ts`,
  any API route, any other questionnaire, or any page.
- **Do NOT add any test-password / auth bypass to `lib/client-portal-auth.ts` again.**
  You did this in the previous run and I reverted it. It is a security hole. If you
  cannot test without it, write your test harness in a scratch file outside the repo,
  or say so in your report and skip that verification step.
- No deletions. No deploys.

## Fixes required

### C1 — CRITICAL: disabled Continue is a dead end
`disabled={!isStepValid(safeStep)}` means `onClick` never fires, so
`markStepTouched` never runs, so no inline "This is required." ever renders.
The client sees a dimmed button that does nothing and gets no explanation.

Fix: do **not** use the HTML `disabled` attribute on Continue. Instead:
- Always allow the click.
- `onClick` calls `markStepTouched(safeStep)` FIRST.
- Then, if `!isStepValid(safeStep)`, short-circuit (do not advance).
- Style the button at reduced opacity when invalid so it still *looks* unavailable
  (`opacity-50 cursor-not-allowed` classes are fine — just not the `disabled` attr,
  because that kills the click event).
- Keep `aria-disabled={!isStepValid(safeStep)}` for accessibility, but not `disabled`.

Result: tapping Continue on an empty step reveals all the red inline errors.

### C2 — CRITICAL: `identity.mohOwner` never required when `mohApproval === "Yes"`
`REQUIRED_BY_STEP.identity` lists `mohApproval` but not `mohOwner`, and
`activeRequired()` never adds it.

Fix: in `activeRequired()` (or whatever resolves the per-step required list),
dynamically append `"identity.mohOwner"` when
`payload.identity.mohApproval === "Yes"`.

### H1 — HIGH: picking "No" to `hasRunAds` is irreversible
When `hasRunAds === "No"` the `previousAds` section is removed from
`visibleSections` — but the dropdown that sets `hasRunAds` lives *inside* that
section. The client can therefore never switch back to "Yes".

Fix: keep the `Has run paid ads before?` select reachable when the answer is "No".
Simplest correct approach: when `hasRunAds === "No"`, still render the section but
show ONLY that one select plus a short line —
`No problem — we will start from scratch. Change this to "Yes" if you have run ads before.`
Then hide the rest of the section body. Do not leave the client stuck.

### H2 — HIGH: access checklist shows no error for 3-of-4 checked
The single `<RequiredError show={showErrorFor("leadsAccess.accessAdAccount")} />`
only reflects ONE checkbox. If the other three are unchecked the button blocks but
no message shows.

Fix: render ONE checklist-level error when any of the four is unchecked and the step
is touched. Copy: `All four access items must be ticked before we can start. If you
are stuck on any of them, write "need help" in the working hours field and we will
walk you through it.`
(That last sentence matters — a client who cannot find their pixel should have a way
out that is not abandoning the form.)

### M1 — MEDIUM: phone field has no numeric keypad
Add `inputMode="tel"` to the `Phone` `TextField`. Also add `inputMode="numeric"`
to `adBudgetExact` and `servicePrice` if not already set.

### M2 — MEDIUM: autosave can race the final submit
A 1s debounce timer scheduled *before* `setSubmitting(true)` is not cleared and
still fires after submit.

Fix: keep a `saveTimerRef` for the autosave timeout. In `handleSubmit`, call
`window.clearTimeout(saveTimerRef.current)` before POSTing. Also re-check
`submitting` inside the autosave fetch body before sending.

## Verification required — report real output

1. `npx tsc --noEmit` — paste the tail.
2. `npm run build` — paste the tail.
3. Confirm by reading your own code and stating it plainly:
   - Tapping Continue on an empty required step shows the inline errors (C1).
   - `mohOwner` blocks when `mohApproval === "Yes"` (C2).
   - Choosing "No" for `hasRunAds` leaves a way back to "Yes" (H1).
   - Unticking any access box shows a visible message (H2).
4. Do NOT claim browser verification you did not do. If you cannot test in a browser
   without the auth bypass, say exactly that.

## Report back
Each fix: what you changed and the line/location. Then the tsc + build output.
Then anything you could not verify.
