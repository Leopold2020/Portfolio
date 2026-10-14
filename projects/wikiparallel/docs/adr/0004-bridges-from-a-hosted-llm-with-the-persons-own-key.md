# Bridges come from a hosted LLM called with the person's own key

A Bridge is generated on demand for a single Parallel by calling Anthropic's
Messages API directly from the browser with a key the person supplies on a
separate settings page and which is stored only in that browser. The model is
given the Challenge and the Parallel's title, Field, Lead Section and headings —
not the Home Field and not the Closeness, both of which bias it toward declaring
a connection that isn't there — and answers under a schema that returns either a
Bridge or a verdict that the two have no real shared structure.

This is the one place where WikiParallel's data leaves the machine, and it is a
deliberate exception to ADR-0001 rather than a retraction of it: search is
unchanged, so a Challenge is still embedded and ranked entirely client-side and
the tool works with no key at all. We chose this over three alternatives. A
generative model running in the browser would preserve ADR-0001 whole, but costs
a further several hundred megabytes on top of the 34 MB embedding model, and a
model small enough to ship writes confident nonsense — fatal here, because
articulating a cross-Field analogy is exactly the task where a reader cannot tell
a real mapping from a fluent one. A backend proxy holding one shared key would
give the best experience, but destroys the "nothing to deploy or keep running"
property that ADR-0001 exists to protect. Highlighting the Lead Section sentences
closest to the Challenge needs no model at all, but shows *where* the similarity
sits without ever stating the shared structure, which is the whole point.

The costs we accept: a fresh clone cannot show Bridges until someone adds a key
with credit on it; a Bridge may be inaccurate, which is tolerable only because it
is a triage aid and because the model is allowed to answer that there is no
parallel; and because Bridges are derived from CC BY-SA Lead Sections, both the
card and the README must say plainly that a Bridge is generated text and not
Wikipedia's.
