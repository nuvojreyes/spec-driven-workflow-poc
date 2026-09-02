---
name: skill-changelog-updater
description: Use this skill when the user has modified, improved or updated an existing Nuvolar Skill file and needs to update its CHANGELOG and version number. Triggers when the user says things like "update the changelog", "bump the version", "I changed this skill", "updated skill", pastes a skill file asking to register changes or when the user performs a change in a skill in any language. Do NOT use this skill for creating new skills from scratch, for updating project changelogs unrelated to Skills, or for git commit messages.
metadata:
  version: 1.0.0
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
   Use only the sections that apply (Changed, Added, Fixed, Removed).
