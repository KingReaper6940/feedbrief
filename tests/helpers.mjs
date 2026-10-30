import {JSDOM} from 'jsdom';export const dom=new JSDOM('');export const Parser=dom.window.DOMParser;
export const rss=body=>'<rss version="2.0"><channel><title>Example</title><link>https://example.com/</link><description>A fictional feed</description>'+body+'</channel></rss>';
export const atom=body=>'<feed xmlns="http://www.w3.org/2005/Atom"><title>Example</title><id>urn:feed:example</id><updated>2026-01-01T00:00:00Z</updated>'+body+'</feed>';
