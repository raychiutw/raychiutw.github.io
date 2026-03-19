# Spec: Line Endings Normalization

## ADDED Requirements

### Requirement: Global autocrlf configuration

The developer's global git configuration MUST set `core.autocrlf` to `input`.

This SHALL ensure that CRLF line endings are converted to LF on commit, and no conversion is performed on checkout.

#### Scenario: Developer commits a file with CRLF on Windows

- Given a Windows environment with `core.autocrlf = input`
- When the developer stages and commits a text file containing CRLF line endings
- Then git SHALL convert all CRLF sequences to LF before writing to the repository

#### Scenario: Developer checks out a file on Windows

- Given a Windows environment with `core.autocrlf = input`
- When the developer checks out a text file from the repository
- Then git MUST NOT convert LF line endings to CRLF in the working tree

---

### Requirement: .gitattributes text normalization

The repository `.gitattributes` file MUST contain the rule `* text=auto eol=lf`.

This SHALL enforce LF line endings for all auto-detected text files at the repository level, independent of individual developer configuration.

#### Scenario: New contributor without global autocrlf setting

- Given a developer who has not configured `core.autocrlf`
- When they clone the repository and commit text files
- Then the `.gitattributes` rule SHALL normalize line endings to LF

---

### Requirement: Binary file exclusions

The `.gitattributes` file MUST declare the following image formats as binary: `png`, `jpg`, `gif`, `svg`, `ico`, `webp`, `avif`.

Git SHALL NOT apply any text transformation or line-ending conversion to these files.

#### Scenario: Adding a webp image to the repository

- Given a `.gitattributes` file with `*.webp binary`
- When a developer adds a `.webp` file to the repository
- Then git MUST treat the file as binary and not modify its contents

#### Scenario: Adding an avif image to the repository

- Given a `.gitattributes` file with `*.avif binary`
- When a developer adds an `.avif` file to the repository
- Then git MUST treat the file as binary and not modify its contents

---

### Requirement: Renormalization of existing files

After updating `.gitattributes`, the developer MUST run `git add --renormalize .` to apply the new line-ending rules to all tracked files.

Any files previously stored with CRLF SHALL be re-staged with LF line endings.

#### Scenario: Existing CRLF files after renormalization

- Given a repository with text files stored with CRLF line endings
- When the developer runs `git add --renormalize .`
- Then those files SHALL be staged with LF line endings
- And `git status` SHALL show them as modified
