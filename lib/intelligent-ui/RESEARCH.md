# Intelligent UI: conversation first

Research checked October 16, 2026. This records the rationale and evaluation plan
for the playground redesign, not validated outcomes for Recoup.

## Decision and scope

Help the person understand, explore, decide or act. Compose ordinary prose,
static visuals and optional interaction in the order that serves the answer.
A static representation can earn space through understanding alone. A control,
custom table or business action is not evidence of added value.

The current three specimens deliberately contrast:

- A supplier question answered with prose and ordinary Markdown.
- A listening-concentration explanation with a static ranked distribution.
- An arrangement explanation with original audio, time-bound authored notes and
  linked section selection/playback.

This replaces the earlier one-collection constraint and action-oriented examples.
Representations, optional behavior and typed state are separate: the same time
position coordinates a media player, interval selector and explanation. It is not
one bespoke component per business tool or story.

This remains an authored fixture demonstration with paced NDJSON, not a live chat
integration, model producer, MCP host integration or published SDK. The original
instrumental is synthesized locally; its notes describe that arrangement rather
than claim analysis of a customer recording. No participant study has established
that these choices improve Recoup outcomes.

## Evidence and its limits

The following are primary research sources. Publication status, study population,
comparison, and measured outcome matter more than a headline preference score.
The design decisions below are our inferences, not findings that these studies
tested on Recoup.

| Source                                                                                                                                                                          | Evidence                                                                                                                                                                                                                                                                                       | Limits and relevance                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Generative Interfaces for Language Models, Findings of ACL 2026](https://aclanthology.org/2026.findings-acl.74.pdf), sections 3.3, 4.3–4.4 and Limitations. Peer reviewed.     | The synthetic benchmark used 100 queries and 428 annotators. A separate evaluation used 380 self-authored queries from 76 people: GenUI won 50.8%, tied 8.2%, and lost 41.1%. Authors identify simple how-to cases where text was preferable.                                                  | These are pairwise preferences, not verified task accuracy or completion-time gains. Their discussion of cognitive load partly derives from comments. Generating UI for every query is an acknowledged limitation. Polished presentation also increased perceived authority, which does not establish correctness. |
| [DuetUI, CHI 2026 author version v2](https://arxiv.org/html/2509.13444v2), sections 7–8. Peer reviewed; DOI [10.1145/3772318.3790441](https://doi.org/10.1145/3772318.3790441). | Within-subject study with 24 participants comparing DuetUI and Stitch. SUS was 73.65 versus 63.47. Prompting duration was 20.12s versus 49.37s. Overall task duration, 188.38s versus 195.38s, was not significantly different; neither was overall NASA-TLX workload.                         | Campus recruitment, ages 18–31, short sessions. The benefit is more specific than “generated UI makes tasks faster”: interaction reduced prompting effort and improved perceived usability. The February 2026 revision adds behavioral analysis absent from the original preprint.                                 |
| [Bridging Gulfs in UI Generation through Semantic Guidance, CHI 2026](https://www.seokhyeon.com/chi26-uigeneration.pdf), section 6. Peer-reviewed author copy.                  | Fourteen designers, engineers, and product managers used both a semantic interface and a chat baseline with the same generation model. Perceived intent expressiveness and output interpretability improved. Participants valued scoped edits and described unrelated changes in the baseline. | This concerns practitioners generating UI designs, not end users reading AI answers. Several participants found the information density initially difficult. It supports investigating predictable changes and progressive disclosure, not a universal layout prescription.                                        |
| [Generative and Malleable User Interfaces / Jelly, CHI 2025](https://arxiv.org/html/2503.04084v1), section 8. Peer-reviewed author version.                                     | Eight participants completed a tutorial and two self-chosen information tasks in approximately 80-minute sessions. Participants valued persistent structures, localized modifications, and traceable history; repeatedly describing incremental changes could be tedious.                      | Small exploratory study, daily AI users, no controlled task-performance baseline. Its evidence motivates continuity and lightweight refinement; it does not prove a dashboard is better than a concise answer.                                                                                                     |
| [DirectGPT, CHI 2024](https://damienmasson.com/pdfs/directgpt.pdf), sections 4–5. Peer-reviewed, older supporting evidence.                                                     | Twelve participants with programming and ChatGPT experience completed 288 text/code/vector editing tasks. Direct manipulation produced approximately 50% faster completion, 50% fewer prompts, and 72% shorter prompts. Participants still used prompting for global changes.                  | GPT-3.5, technical participants, localized editing tasks. This is task-performance evidence for targeting and reversible manipulation, not evidence for ornamental summaries, metric cards, or every task becoming a mini-application.                                                                             |

## Official guidance is not an independent user study

- [OpenAI: GPT-6 and Intelligent UI for everyone, October 7, 2026](https://openai.com/index/gpt-6-for-everyone/)
  describes combining prose, visuals, and interaction according to the question,
  including choosing plain text when sufficient. It describes native streamable
  components and progressive compilation. This is a first-party product and
  implementation account, not evidence that Recoup has the same runtime, training,
  design quality, or user outcomes. It does not publish a reusable Intelligent UI
  compiler contract for this prototype.
- [OpenAI plugin UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines)
  recommend optional, focused UI that improves a conversational workflow, limited
  actions, preserved edits, shallow navigation, and accessibility. They discourage
  nested scrolling and duplicating the host's inputs. These are platform design
  guidelines, not experimental findings. Their current inline widget ordering is
  specific to ChatGPT; our native Recoup specimen deliberately places the primary
  answer first. We retain Recoup's tokens and typography rather than importing a
  different host's visual identity.
- [OpenAI: What makes a great ChatGPT app, November 24, 2025](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app)
  frames app value as specific capabilities introduced at a relevant moment in a
  conversation. This supports a small interaction surface rather than porting a
  complete navigation hierarchy. It is vendor design guidance, not comparative
  usability evidence.

## Design decisions and selection

These are implementation hypotheses informed by the sources and the user-provided
examples. They are not experimentally optimal layouts or findings about Recoup.

| Prior assumption                                         | Current decision                                                               | Intended benefit                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| A comparison with different values deserves a collection | Prefer good Markdown when it already communicates a few quotes clearly         | Avoid a bulky duplicate of an ordinary answer                   |
| UI must lead to a decision or action                     | Understanding and exploration can complete a response                          | Allow useful distributions, diagrams and media explanations     |
| One compact object follows every answer                  | Order prose, representation and interpretation purposefully                    | Keep the explanation connected to the relevant visual           |
| Modularity means sharing a list/table component          | Share representations, optional behavior, typed state and data semantics       | Coordinate views and reuse behavior across domains              |
| Add interactivity to justify rich output                 | Static visuals are sufficient when controls add no benefit                     | Reduce work and distraction                                     |
| Put model-authored numeric claims beside a chart         | Calculate the concentration insight from the same validated values as the bars | Prevent changed values from retaining a stale computed headline |
| Rebuild a playback interface                             | Use a native player and a linked section representation                        | Preserve familiar accessible playback controls                  |

The authored recipe identifies the intended benefit. The policy verifies that its
registered representation and host support fit that request. It is not a learned
or independently validated usefulness judge. Data shape alone never requests UI.
A future generator needs selection evaluations against strong text and static
baselines, including cases where it should choose no custom representation.

Useful space follows the information need. A distribution or media explanation
can occupy more room than a sentence; it still needs a readable hierarchy,
restrained chrome, preserved conversational context and accessible alternatives.
Use Recoup Sky tokens and typography rather than importing another host's skin.

## Interaction constraints

### Evidence without a permanent dashboard

- Attach a small, clearly labelled source affordance to the relevant claim or row.
  Reveal the source list and details on request; avoid repeating full source text
  below every representation.
- Keep source identity, time, kind, and completeness available in the disclosure.
  Missing, partial, proposed, and withdrawn evidence must remain distinguishable.
- Open details without losing conversational context. Closing restores the trigger's
  focus. A restored source selection must not steal focus on page load.
- A polished card is not confirmation. Collection completeness, stream completion,
  evidentiary support, and permission to act remain different states.

### Predictable streaming

The lab begins with a completed, validated fixture. Ordered answer parts and data
share a revision. A patch that leaves the answer at an older revision is rejected.
Replay commits only after a valid completion and clean EOF, preserving the prior
answer on cancellation or error. A coherent changed response can replace both
text and visual values; the concentration insight recomputes from its data.
Matching revisions do not prove the truth of arbitrary authored prose.

Native time updates, selection and explanation share a bounded position.
Returning to the same timeline can restore that position but never starts audio.
Missing or mismatched audio retains the supplied notes. Section changes do not
move keyboard focus or announce every playhead update.

The following are constraints for future progressive integration, not claims that
the current buffered specimen has validated that experience:

- Update stable objects in place. Preserve selection, playback context, edits, focus, and the
  user's reading position. Never replace user edits with streamed content.
- Do not automatically reorder rows, reveal a new sidebar, or move controls under
  the pointer while a person is interacting. Signal meaningful changes quietly.
- Keep the last validated view available on interruption. Stop and retry are
  explicit; older requests must not overwrite a newer scenario or replay.
- Partial records must look partial. Receiving the final event does not prove a
  complete source, current quote, accepted finding, or authorized operation.
- Local selection and view changes are reversible. Any future business action
  requires its own authorized server path and truthful outcome/receipt handling.

### Mobile and accessibility

- Preserve the conversation's single reading axis. Fit the relevant fields to the
  viewport; use labelled stacked rows when that retains comparison meaning.
  Avoid a permanent rail, deep card navigation, or nested vertical scrollers.
- If a real comparison cannot reflow without losing meaning, provide a labelled,
  keyboard-reachable horizontal table region and a readable text alternative.
  Treat this as an exception to test, not the default mobile presentation.
- Keep native labelled controls, visible focus, logical heading order, table
  semantics where applicable, and status words that do not depend on color.
- Test text resizing, light/dark contrast, narrow screens, keyboard use, and a
  screen reader. Use comfortable touch targets and respect reduced motion.
- Announce meaningful status changes, not every arriving cell. Do not move focus
  for unsolicited updates. Disclosures must expose expanded state and usable
  close/return behavior.

## Proposed evaluation — not run

No participant study or comparative usability result has been produced for this
redesign. Browser checks and automated tests establish behavior, not user benefit.
This research plan is not a new approval or release gate.

### Conditions and procedure

Compare **A: strong prose/Markdown**, **B: an appropriate static visual with
explanation**, and **C: useful interaction where applicable**. All variants use
equivalent facts, qualifications and source access. Do not add artificial controls
or weaken the text baseline to make an interface win. The supplier case should
be allowed to end with Markdown; the listening case need not have controls.

An optional formative target is 12–16 participants across relevant creative,
analyst and operations roles, including nontechnical people. This is a proposed
sample, not completed recruitment or a powered experiment. Counterbalance task
and condition order using matched synthetic variants. Include desktop/mobile,
keyboard and assistive-technology coverage; record actual samples and limits.

Use controlled delivery timing and ask for task answers before preferences.
Observe errors and recovery without coaching. Record local behavior separately
from model or provider waiting. No user study has been run for these specimens.

| Task                    | Expected observation                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supplier trade-offs     | Correctly distinguish fastest/cheapest and sample/certification gaps without extra navigation or an invented purchasing action.                                     |
| Listening concentration | Interpret the share and long tail, name the supplied population/window, and avoid confusing plays with unique listeners or inferring causes.                        |
| Song arrangement        | Locate the stated sections, hear the available source, and explain the authored arrangement change. Compare timestamped text, static intervals and linked playback. |
| Source checking         | Identify what a source supports and what remains absent; source opening alone is not successful verification.                                                       |
| Replay and return       | Preserve selected time, focus and complete response through replay, interruption and a return visit. Playback must not start unexpectedly.                          |

### Measures and decision rule

- **Accuracy:** correct facts, subject identities, qualifications, and absence of
  unsupported approval claims. Report errors separately from successful speed.
- **Time:** task completion time among correct responses, first-useful-answer
  latency, time spent finding a source, and completion/failure rates.
- **Effort:** prompts typed, unnecessary navigation, reversals, and separate
  seven-point ratings of task difficulty and mental effort. These custom ratings
  are not a validated cognitive-load instrument or a NASA-TLX score.
- **Source checking:** successful claim-to-source matching and recognition of
  incomplete evidence. Also record whether participants overtrust visual polish.
- **Continuity and access:** lost edits or playback position, focus jumps, mistaken interval targets,
  keyboard/screen-reader blockers, and narrow-screen reading failures.
- **Preference:** collect last, with an explanation; keep it separate from
  performance and correctness.

Before sessions, freeze task rubrics, delivery timing, exclusion rules, and the
analysis plan. Report per-task paired differences and individual failures;
describe uncertainty and avoid significance claims from an underpowered sample.
Retain a representation when evidence suggests a concrete understanding,
exploration, decision or task benefit without a correctness, source-checking or
access penalty. Interactivity and lower elapsed time are not universal goals.
Remove or revise it when it adds work or hides qualifications. An inconclusive
result is inconclusive, not proof that more UI is better.

## Implementation handoff

The host redesign should preserve the existing validation, stable identities,
revision checks, abort behavior, scoped storage, and production availability gate.
It changes which information receives attention, not who is allowed to act.
Keep the research/selectivity layer separate from the domain data and the pure
renderer so future hosts can apply their own display and capability constraints.

This remains a bounded first specimen. It does not complete the epic's live chat
transport integration, progressive visible streaming, authorized source binding,
cross-device persistence, second host adapter, or action receipt requirements.
Those need their own implementation and evidence. Passing protocol tests and a
polished fixture do not establish live capability or measured user benefit.
