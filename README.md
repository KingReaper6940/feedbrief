# Feedbrief

**A little clarity between the tags.** Read a pasted RSS or Atom snapshot as entry cards, inspect identifiers and selected review receipts, and export a complete review readout locally.

## What you can do

- Inspect **RSS 2.0** and **Atom 1.0** without granting access to a repository or feed account.
- Search titles, IDs and selected links; filter entries with review items, repeated IDs or missing IDs.
- See exact duplicate groups after JavaScript `trim()`, with original one-based **entry numbers**.
- Review selected missing/empty fields, repeated entry title/ID/date elements, and selected HTTP link resolution.
- Resolve relative links using an explicitly supplied feed URL or inherited Atom `xml:base`; never the app's origin.
- Download JSON readouts and Markdown briefs. Save/reopen editable projects or open local UTF-8 XML.
- Keep embedded markup inert. Feed values are displayed as text, and article URLs are not clickable in the inspector.

No uploads, subscriptions, article fetching, analytics, application storage, paid services or runtime dependencies. Browser session restoration and infrastructure logs are outside the application's control.

**Feedbrief is a focused inspector, not a complete feed validator.** Its findings are review prompts, not a feed-validity score or a guarantee that any reader will accept the feed.

## Example

Open the fictional [RSS sample](examples/sample.rss.xml) or [Atom sample](examples/sample.atom.xml). The default RSS sample yields:

| Readout | Result |
| --- | --- |
| Entries | 3 |
| Repeated ID groups | 1 |
| Repeated identifier | `note-001`, entries 1 and 2 |
| Selected findings | 6: three review items and three notes |
| Relative selected link | Entry 3 remains unresolved until a suitable base URL is supplied |

The actual generated [JSON readout](examples/report.json), [Markdown brief](examples/brief.md) and [editable project](examples/project.json) are included. These are genuine output artifacts, **not screenshots**.

A real editor screenshot and native browser visual/responsive checks remain pending. The interface implements responsive CSS, input labels, keyboard controls and live status announcements; this is not a completed accessibility audit.

## Run locally

Use Node.js 22 or 24 and npm:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4190. The preview binds to loopback and serves only the ten allowlisted assets in `dist/`; stop with Ctrl+C.

Build uses Node built-ins. jsdom 26.1.0 is pinned for **tests and example generation only**, not included in the deployed app. `npm run example` regenerates the checked-in examples.

## Use

1. Paste feed XML, choose a sample, or open a **UTF-8 XML** file.
2. Optionally enter the original feed URL. It provides a resolution base only; no network request is made.
3. Select **Inspect snapshot** and review feed metadata, duplicate-ID groups and entry cards.
4. Search/filter the readout and open a card's receipts. Entry numbers stay in the original XML order, not the current filtered order.
5. Download the **JSON readout** or **Markdown brief**. **Save editable project** stores the entire XML and base URL; reopening a project restores both.

Changing the source/base clears results and revokes old download URLs until you inspect again. Invalid imports preserve current work. A delayed import cannot replace edits made while it was loading.

### Selected extraction rules

- RSS requires an unqualified `rss version="2.0"` root with exactly one direct unqualified `channel`. Direct `item` children become entries.
- Atom requires a `feed` root in `http://www.w3.org/2005/Atom`; namespace prefixes can vary. Direct Atom `entry` children become entries.
- Core fields are read by exact namespace and direct-child position. Foreign extensions are ignored.
- Titles, identifiers, supplied dates and extracted text use JavaScript `trim()`. This deliberately trims more than XML whitespace; the original source remains in an editable project.
- Entry text uses RSS `description`, or Atom `summary` then `content`. Only `textContent` is extracted; encoded HTML may appear as literal markup, and XHTML contributes its text. Remote `content src` is not fetched.
- RSS `guid` is an identifier; `isPermaLink` does not turn it into a followed URL. A missing guid or pubDate is an informational note because those RSS fields are optional.
- The first RSS `link`, or first Atom link with absent `rel` or `rel="alternate"`, is selected. Atom language/type preferences and multiple alternate links are not evaluated.
- Atom `xml:base` is applied along the selected link's ancestors. Empty base attributes inherit. Absolute HTTP(S) links need no base; a later absolute base can reset an unknown relative base.
- URLs use the native WHATWG URL implementation and must resolve to credential-free HTTP(S), with no ASCII whitespace/control characters. Other schemes may be valid in feed standards but are **unsupported here**, not proof of an invalid feed.
- Identifiers are compared exactly after trimming; no URI normalization, case folding or content-based identity inference. Shared resolved HTTP URLs are grouped separately after native URL normalization.

### What receipts cover

Selected missing/empty feed title, Atom feed ID/updated, RSS channel description, selected feed link, entry title/ID/date/text, repeated entry title/ID/date elements, duplicate trimmed IDs and shared/unresolved selected links.

These checks do **not** cover every required or conditional field. In particular, Feedbrief does not validate author requirements, date syntax/timezones, Atom IDs, RSS guid permalink rules, HTML types, XML schema conformance, enclosures, podcast rules, HTTP headers, linked pages, full text content or reader behavior. It does not deduplicate, repair, rewrite or publish feeds.

An empty snapshot can be intentional. No findings from the selected checks is not a conformance verdict. Repeated IDs or links do not prove the articles are duplicate content.

## Limits and exports

| Limit | Behavior |
| --- | --- |
| Source | 1–100,000 UTF-16 text units; whitespace-only input rejected |
| XML structure | At most 5,000 elements, depth 32, and 200 direct entries; excess blocks the whole inspection |
| XML features | DTDs, entity declarations and stylesheet processing instructions rejected, even when mentioned in comments |
| Local files | UTF-8 only, decoded with fatal error handling; XML up to 400,000 bytes, project JSON up to 800,000 bytes |
| Editable project | JSON up to 250,000 text units, XML revalidated before replacement; optional base URL up to 2,048 units |
| Entry view | 10 cards/page; preview fields clipped with an omitted-unit count, without cutting surrogate pairs |
| Findings view | First 100 messages, with omissions disclosed |

There is no automatic truncation of accepted entries. Search, filters, pagination and preview clipping affect only the view.

- **JSON readout:** every extracted feed/entry field, raw and resolved selected links, counts, duplicate groups, all findings and the check scope. Does not include the original XML or ignored extensions.
- **Markdown brief:** full selected title/ID/date/text/link readouts and all finding messages. JSON retains additional structural metadata such as field counts, summary type, raw-versus-resolved link details and duplicate-group objects.
- **Editable project:** complete original XML text and base URL. No subscription state, entry edits or view filters.

Exports can contain article text, private identifiers and sensitive URLs. Review before sharing. File decoding is UTF-8 regardless of an XML encoding declaration; unsupported encodings must be converted first. Textareas may normalize CR/CRLF, so projects are not a byte-for-byte archive of an imported file.

## Verification

`npm test` passes **26 checks**, including a parent test and nine real app-handler subtests in **jsdom**. Coverage includes:

- XML well-formedness errors, namespaces, direct-child extraction and structural/input limits.
- Relative and absolute links, inherited/empty/resetting xml:base, and unsupported schemes/credentials.
- Duplicate-ID accounting across 35 generated snapshots and exact original entry numbering.
- Complete exports despite 120-entry filtered/paged views and the 100-finding preview cap.
- Inert HTML/script strings, stale URL revocation, unchanged source, malformed UTF-8/import failures, and delayed-import edit preservation.
- Unicode-safe preview clipping and Markdown fences that cannot be closed by embedded backticks.

CI runs tests and builds on Node 22 and 24, Windows and Linux. These simulated DOM tests do not establish native browser rendering, accessibility, file download destinations or behavior across XML parser implementations. Native visual/responsive checks and a real screenshot are incomplete.

## Deploy on Vercel

Import this repository into your existing Vercel account. Select **Other**, repository root, build command `npm run build`, output `dist`, and Node 22 or 24. The checked-in `vercel.json` supplies build/output settings, an empty install command (build needs no dependencies) and static response headers.

No environment variables, paid integrations, database or external API is required. A GitHub-connected main branch can deploy on push. Run tests before publishing changes.

## References

- [RSS 2.0 specification](https://www.rssboard.org/rss-specification)
- [RFC 4287: Atom Syndication Format](https://www.rfc-editor.org/rfc/rfc4287)

MIT licensed. No claim of complete validation, reader compatibility, novelty or independently verified demand.
