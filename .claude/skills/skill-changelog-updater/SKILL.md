---
name: skill-changelog-updater
description: Use this skill when the user has modified, improved or updated an existing Nuvolar Skill file and needs to update its CHANGELOG and version number. Triggers when the user says things like "update the changelog", "bump the version", "I changed this skill", "updated skill", pastes a skill file asking to register changes or when the user performs a change in a skill in any language. Do NOT use this skill for creating new skills from scratch, for updating project changelogs unrelated to Skills, or for git commit messages.
metadata:
  version: 1.1.0
  author: FE Guild
---

# Nuvolar Skill Changelog Updater

## Overview

Automatically updates the CHANGELOG section and version number of a Nuvolar Skill file when changes are made to it. Follows semantic versioning (semver) and keeps a consistent changelog format across all Skills in the Nuvolar guild repository.

## When to use

- An agent has modified the `description`, instructions, examples or output format of an existing Skill
- Someone asks to bump the version of a Skill after reviewing changes
- A Skill is being reviewed and the changelog is missing or outdated
- Multiple changes are being merged into a Skill and need a single version bump
- There are committed changes on skills that are not reflected in the corresponding CHANGELOG.md(manual developer changes as this skill is only triggered when the agent is called). In this case, check the commit history to get the latest changes.

## When NOT to use

- Updating a project CHANGELOG.md unrelated to Skills
- Generating git commit messages (use nuvolar-commit-message for that)
- Minor typo fixes that do not affect Skill behaviour (PATCH bump is optional for these — skip if the team prefers)

## Versioning rules

Nuvolar Skills follow semantic versioning (semver: MAJOR.MINOR.PATCH).

| Change type                                                                                                                     | Bump          | Example       |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| Rewrites description/trigger logic, removes or renames sections, breaks compatibility with how the Skill was previously invoked | MAJOR (x.0.0) | 1.2.0 → 2.0.0 |
| Adds new trigger phrases, new instructions, new examples, extends scope                                                         | MINOR (0.x.0) | 1.2.0 → 1.3.0 |
| Fixes typo, rephrases for clarity, minor formatting, does not change behaviour                                                  | PATCH (0.0.x) | 1.2.0 → 1.2.1 |

## Instructions

1. **Receive the Skill file and the change description**
   The user will provide one of the following:
   - The full current Skill file + a plain-language description of what changed
   - The full current Skill file + a diff
   - Just a description of the change (ask for the file if not provided)
   - Just reference the skill file using @ markup.

   If the Skill file is not provided, say:
   _"Please paste or attach the current content of the Skill file so I can update it correctly."_

2. **Extract the current version**
   Read the `version:` field from the YAML frontmatter.
   If missing, assume `1.0.0` and note it in the changelog entry.

3. **Classify the change**
   Based on the versioning rules above, classify the change as MAJOR, MINOR or PATCH.
   If the change description is ambiguous, ask:
   _"Is this change modifying how the Skill is triggered or its core behaviour (MAJOR/MINOR), or just a clarification with no behavioural impact (PATCH)?"_

4. **Compute the new version**
   Increment the correct segment and reset lower segments to zero:
   - MAJOR: x.0.0 (reset minor and patch)
   - MINOR: keep major, increment minor, reset patch to 0
   - PATCH: keep major and minor, increment patch

5. **Write the changelog entry**
   Use today's date in YYYY-MM-DD format.
   Use only the sections that apply, from the vocabulary below.

   Entry format — newest version first, directly under the file title:

   ```markdown
   ## [<new-version>] - <YYYY-MM-DD>

   ### <Section>
   - <What changed, and why it changed.>
   ```

   Section vocabulary, in this order when several apply:

   | Section | Use for |
   | --- | --- |
   | `Added` | New capability, new trigger phrase, new section, new example |
   | `Changed` | Reworked behaviour, rewritten instructions, altered output format |
   | `Fixed` | Corrected instruction, broken reference, wrong example |
   | `Removed` | Deleted section, dropped trigger, retired capability |
   | `Documentation` | Clarifications and notes with no behavioural change |

   Write entries so a reader who was not present can act on them:

   - State the change, then the rationale. "Why" is the part that dates well.
   - Name the artefacts you touched in backticks (`description`, a section
     heading, a step number) so the entry maps onto the diff.
   - One bullet per coherent change; do not merge unrelated edits into a
     single bullet, and do not split one change across several.
   - Bold the lead clause of a substantial bullet, as the existing
     changelogs in this repository do.
   - Never edit or delete a published entry. Corrections go in a new one.

6. **Update the version in the frontmatter**
   Set `metadata.version` in the Skill's YAML frontmatter to the new
   version. This field and the newest changelog heading must always agree —
   a bumped changelog with a stale frontmatter is the most common defect
   this skill exists to prevent.

   ```yaml
   ---
   name: <skill-name>
   description: <unchanged unless the change was to the trigger>
   metadata:
     version: <new-version>
     author: <unchanged>
   ---
   ```

7. **Create the CHANGELOG.md if it is missing**
   New file, in the Skill's own directory, alongside `SKILL.md`:

   ```markdown
   # Changelog — <skill-name>

   ## [<version>] - <YYYY-MM-DD>

   ### Added
   - Initial release: <one sentence on what the Skill does>.
   ```

   If the Skill already existed without a changelog, reconstruct the
   history from `git log --follow -- <path>/SKILL.md` rather than inventing
   it, and mark any version you inferred as such.

8. **Verify before reporting**

   - [ ] `metadata.version` matches the newest changelog heading.
   - [ ] New version is strictly greater than the previous one, with lower
         segments reset.
   - [ ] Date is today, `YYYY-MM-DD`.
   - [ ] Every section used is from the vocabulary above.
   - [ ] Entries name real artefacts and are traceable to the diff.
   - [ ] No previously published entry was altered.
   - [ ] Newest entry sits at the top of the file.

9. **Report back in this shape**

   ```
   Skill:     <path to SKILL.md>
   Version:   <old> → <new>  (<MAJOR|MINOR|PATCH>)
   Reason:    <why that classification>
   Changelog: <path to CHANGELOG.md>  (created | updated)
   Entry:     <the sections and bullet count written>
   Frontmatter: updated | already correct
   ```

   Then offer the matching PR title, per this repository's convention:

   ```
   [<skill-name> v<new-version>] <short description>
   ```

## Worked example

Input: the author added two trigger phrases and one example to
`agents/devops/skills/aws-cost-analysis/SKILL.md`, currently at `1.5.0`.

Classification: new trigger phrases and a new example extend scope without
breaking how the Skill is invoked → MINOR → `1.6.0`.

`CHANGELOG.md` gains, at the top:

```markdown
## [1.6.0] - 2026-09-02

### Added
- **Two trigger phrases for month-over-month questions** ("compare last
  month", "cost trend") so the Skill activates on comparison requests that
  previously fell through to the generic agent.
- Worked example for a multi-account Organizations payer, covering the
  consolidated-billing case the existing single-account example did not.
```

`SKILL.md` frontmatter becomes `version: 1.6.0`.

## Edge cases

| Situation | Handling |
| --- | --- |
| Several changes at once | One version bump, classified by the highest-ranking change; one entry with several bullets. |
| Version present in frontmatter but no changelog | Create the file, seed it with the current version as the initial entry, then add the new one above it. |
| Changelog ahead of frontmatter, or vice versa | Trust the changelog, fix the frontmatter, and note the correction in the new entry's `Fixed` section. |
| Two bumps on the same date | Two headings, same date, newest first. Dates are not unique keys. |
| Author unsure whether behaviour changed | Ask. Do not default to PATCH to avoid the question — a mis-classified MINOR hides a behavioural change from every downstream consumer. |
| Pre-1.0.0 Skill (`0.x.y`) | Same rules; a breaking change increments the minor, since `0.x` carries no stability promise. |
| Change is purely a typo | PATCH, or skip the bump entirely if the team prefers — say which you did. |
