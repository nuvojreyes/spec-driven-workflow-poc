# Changelog — skill-changelog-updater

## [1.1.0] - 2026-09-02

### Added
- **Completed the procedure, which stopped mid-step upstream.** Step 5
  ended at "Write the changelog entry" with no entry format, so the Skill
  described a task it never specified. Step 5 now carries the entry
  template and the section vocabulary (`Added`, `Changed`, `Fixed`,
  `Removed`, `Documentation`) with rules for writing traceable bullets.
- Steps 6 to 9: update `metadata.version` in the frontmatter, create a
  missing `CHANGELOG.md` (reconstructing history from `git log --follow`
  rather than inventing it), a pre-report verification checklist, and a
  fixed report shape that also emits the `[<skill> v<version>]` PR title
  this repository uses.
- Worked example covering a MINOR bump, and an edge-case table for
  multiple simultaneous changes, frontmatter/changelog drift, same-day
  bumps, pre-1.0.0 Skills, and typo-only changes.

### Fixed
- Frontmatter/changelog agreement is now an explicit invariant. It was the
  defect the Skill was written to prevent, yet no step told the agent to
  touch the `version:` field.

## [1.0.0] - 2026-07-08

### Added
- Initial release: reads a Skill's YAML frontmatter version, classifies a change as MAJOR/MINOR/PATCH per semver rules, computes the new version, and writes a changelog entry.
