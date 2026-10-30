export const RSS_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Field Notes</title>
    <link>https://example.com/notes/</link>
    <description>A fictional publishing snapshot for review.</description>
    <item>
      <title>A slower morning</title>
      <link>https://example.com/notes/morning</link>
      <guid isPermaLink="false">note-001</guid>
      <pubDate>Tue, 06 Jan 2026 09:00:00 GMT</pubDate>
      <description><![CDATA[<p>A short note about making room for a quiet start.</p>]]></description>
    </item>
    <item>
      <title>The walking list</title>
      <link>https://example.com/notes/walking</link>
      <guid isPermaLink="false">note-001</guid>
      <description>A second post that accidentally reuses the first identifier.</description>
    </item>
    <item>
      <title>Window garden</title>
      <link>/notes/garden</link>
      <description>An item without a guid and with a relative link to review.</description>
    </item>
  </channel>
</rss>`;
export const ATOM_EXAMPLE = `<feed xmlns="http://www.w3.org/2005/Atom" xml:base="https://example.com/">
  <title>Studio Journal</title><id>urn:feed:studio</id>
  <updated>2026-01-06T09:00:00Z</updated><link href="journal/"/>
  <entry xml:base="journal/">
    <title>First light</title><id>urn:entry:first-light</id>
    <updated>2026-01-06T09:00:00Z</updated><link href="first-light"/>
    <summary type="text">A fictional entry, with a link resolved through xml:base.</summary>
  </entry>
</feed>`;
