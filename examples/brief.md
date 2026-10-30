# Feedbrief

Selected field-presence, repeated-entry-field, duplicate trimmed-identifier and selected HTTP-link checks only. Not feed conformance, date, content or reader-compatibility validation.

Format: RSS 2.0

## Feed

```text
Title: Field Notes
Identifier: 
Updated: 
Description/subtitle: A fictional publishing snapshot for review.
Selected link: https://example.com/notes/
```

## Entry 1

```text
Title: A slower morning
Identifier: note-001
pubDate: Tue, 06 Jan 2026 09:00:00 GMT
Published: 
Selected link (resolved): https://example.com/notes/morning
Extracted text:
<p>A short note about making room for a quiet start.</p>
```

## Entry 2

```text
Title: The walking list
Identifier: note-001
pubDate: 
Published: 
Selected link (resolved): https://example.com/notes/walking
Extracted text:
A second post that accidentally reuses the first identifier.
```

## Entry 3

```text
Title: Window garden
Identifier: 
pubDate: 
Published: 
Selected link (unresolved): /notes/garden
Extracted text:
An item without a guid and with a relative link to review.
```

## All review receipts

```text
Entry 2 | note | entry-date | No RSS pubDate; this field is optional.
Entry 3 | note | entry-id | No RSS guid; guid is optional, but stable identifiers help readers.
Entry 3 | note | entry-date | No RSS pubDate; this field is optional.
Entry 3 | review | entry-link | Link was not resolved: unresolved.
Entry 1 | review | duplicate-id | Identifier also appears in entries 2.
Entry 2 | review | duplicate-id | Identifier also appears in entries 1.
```
