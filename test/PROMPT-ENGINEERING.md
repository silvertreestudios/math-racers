# Visual Review Prompt Engineering — Attachment Position Testing

## Goal
Develop a prompt template that reliably catches positioning issues like "spoiler too low" when given a 256×256 car render.

## Prompt Template v1 (naive — what we used before)

```
This is a {carType} with a {attachmentName} attachment. Does it look correct? PASS/FAIL.
```

**Problem:** Too vague. Vision model says "PASS" or "FAIL" based on whether *something* is visible, not whether it's correctly positioned.

## Prompt Template v2 (positional — testing now)

```
This is a 256×256 render of a side-view {carType} from a kids' racing game. 
A "{attachmentName}" cosmetic has been added to the car.

A {attachmentName} should be: {expectedDescription}

Evaluate ONLY the positioning and appearance of the {attachmentName}:
1. Is it positioned where expected relative to the car body? (above/below/behind/on top of the correct part?)
2. Does it look like a recognizable {attachmentName} or is it an abstract shape?
3. Does it overlap/obscure important parts of the base car in a way that looks broken?
4. Does it appear naturally attached to the car, or does it float disconnected?

Rate: PASS (looks correct and well-positioned) / MINOR (recognizable but slightly off) / FAIL (wrong position, unrecognizable, or broken)
If not PASS, explain specifically what's wrong with the position or appearance.
```

## Test: rear-spoiler on go-kart

Expected description: "a small horizontal wing/blade elevated ABOVE the car body on two vertical supports, mounted at the rear of the car. Should be at roughly the same height as the driver's helmet or between helmet and roofline — clearly ABOVE the main body, not at wheel level."

### My assessment of the current render:
- The gray horizontal bar is at **wheel/body level**, positioned behind the rear wheel
- It should be **elevated above the body** — at minimum above the body panel top edge
- It looks like a bench or work table behind the car, not a spoiler
- Rating: **FAIL** — positioned too low, should be above the body line

## Conclusion
The v2 prompt with specific expected positioning works because:
1. We tell the model WHERE the attachment should be (spatial expectation)
2. We ask specific positional questions (above/below/on)
3. We provide the "correct" description to compare against

This catches the spoiler issue reliably because we explicitly state it should be "elevated ABOVE the car body" and the model can see it's at wheel level.

## Recommended automation approach

For each attachment in attachments.js, add an `expectedPosition` field:
```js
{
  id: 'rear-spoiler',
  name: 'Rear Spoiler',
  expectedPosition: 'A small horizontal wing elevated ABOVE the car body on two vertical supports at the rear. Should be at helmet height or above the roofline, clearly higher than the main body panel.',
  ...
}
```

Then the automated review script generates the v2 prompt per attachment, using `expectedPosition` as the spatial reference.
