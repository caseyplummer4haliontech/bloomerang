# 01 — Parsing Project Docs

## Prompt 1

> I copy and pasted this json into this file. However, it has some formatting issues and isn't valid. Can you review?

**Response:** Identified invalid JSON in `ci-run-history.json` — a literal newline inside a `failure_message` string (run-036) that broke JSON parsing.

Files touched: none (read-only review)

---

## Prompt 2

> Join the sentence into one line.

**Response:** Joined the broken "should\ncomplete" sentence into a single line in the run-036 `failure_message`.

Files touched: `ci-run-history.json`

---

## Prompt 3

> Validate the entire file.

**Response:** Ran `python -m json.tool` — found another parse error. Fixed invalid double-escaped quotes (`\\"`) in all 7 `data-testid` failure messages to proper escaped quotes (`\"`). Re-validated successfully.

Files touched: `ci-run-history.json`

---

## Prompt 4

> I ran it through a prettier tool. Please re-verify validity.

**Response:** Re-ran `python -m json.tool` — JSON parsed cleanly after prettier formatting.

Files touched: none (read-only validation)

---

## Prompt 5

> Please read "DevEx Take Home Project - 2026.md". I have extracted out some of the data into 4 other files. See attached.
>
> However, can you please make a new .md file which is focused on the text that is NOT present in the 4 files? I'm essentially wanting to read the original document, but not have the extracted data be present.
>
> Attached: ci-run-history.json, developer-feedback.json, repositories.md, workflows.json

**Response:** Read the original brief and all 4 extracted data files. Created a new version of the brief with all inline data (JSON blocks, repository table) removed, keeping only the narrative text, headings, and instructions.

Files touched: `context/DevEx Take Home Project - 2026 (no data).md` (created)

---

## Prompt 6

> You can keep the headings, and then but a short 1 line reference to the file that should contain the data. Example:
>
> See developer-feedback.json

**Response:** Added one-line file references under each Mock Data section heading (e.g., "See workflows.json", "See ci-run-history.json", "See developer-feedback.json").

Files touched: `context/DevEx Take Home Project - 2026 (no data).md`


