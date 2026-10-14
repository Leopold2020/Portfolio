# Evaluation

A record of what `node build/eval.mjs` showed on **2026-09-08**, against the
998-article `corpus.json` (11 Fields). The harness embeds each Challenge with
the same `embedText()` the build uses and ranks it with the same
`rankParallels()` the browser runs, then prints the first page of Parallels
grouped by Field. Re-run the script to refresh these numbers; the prose below is
hand-written against that run.

Closeness values across the whole run sat in a narrow **76–87** band, so the
per-Parallel notes talk about usefulness, not the number.

## Challenges and per-Challenge notes

### 1. "handling a sudden surge of users" — Home Field: Technology

Returned: Information Age, New religious movement, Anger, Power (political
science), Flood, Algorithm.

Weak. **Flood** is the one genuinely useful nudge — an overflow that swamps
capacity that is normally dry. Nothing about crowds, stampedes, bank runs,
epidemics or queueing came back, because those specific analogues are not Level 3
articles. "Anger" and "Algorithm" are noise (see overall observations).

### 2. "keeping a team motivated over a long project" — Home Field: Society and social sciences

Returned: Design, Sport, Exercise, Research, Engineering, Civil engineering.

Weak. These are all "structured productive activity" topical neighbours rather
than parallels for motivation. **Sport** and **Exercise** (sustaining effort,
training regimes, pacing) are a faint useful thread; the rest is filler.

### 3. "allocating a scarce resource among competing demands" — Home Field: Society and social sciences

Returned: Nutrition, Ecosystem, Infrastructure, Hydropower, Statistics,
Algorithm.

Partly useful. **Ecosystem** (organisms competing for finite energy and
nutrients) is a real cross-field parallel, and **Nutrition** (the body
prioritising a limited intake) is decent. Infrastructure/Hydropower/Statistics
are topical drift.

### 4. "detecting a small failure before it cascades into a large one" — Home Field: Technology

Returned: Alan Turing, Stroke, Radioactive decay, Measurement, Algorithm,
Probability.

One of the stronger sets. **Stroke** (time-critical early warning signs, "act
fast before damage spreads") is a strong parallel, and **Radioactive decay**
offers the chain-reaction image. Alan Turing and Algorithm are off-target.

### 5. "preserving knowledge so it outlives the people who created it" — Home Field: Everyday life

Returned: History of technology, Prehistory, Museum, Knowledge, Epistemology,
Oral tradition.

Best-performing Challenge. **Oral tradition**, **Museum** and **Prehistory** are
all genuine parallels for transmitting knowledge across generations. Caveat: this
Challenge is close to concepts that are *named directly* in the list, so it is
arguably near-literal retrieval rather than a cross-field leap.

### 6. "coordinating many independent actors without a central controller" — Home Field: Technology

Returned: Nikola Tesla, Free will, Authoritarianism, Power (political science),
Algorithm, Exponentiation.

Poor. This is a classic emergence / self-organisation / market-mechanism
question, and the corpus has no article for swarms, stigmergy, flocking or price
signals. Authoritarianism and Power (political science) came back as the
*opposite* of the Challenge — central control.

### 7. "recovering and adapting after a major shock" — Home Field: Health, medicine and disease

Returned: Great Depression, Afterlife, Anger, Fear, Natural disaster, Suicide.

Mixed. **Great Depression** (economic recovery over a decade) and **Natural
disaster** (response and rebuilding) are useful. Fear and Anger are loose
"shock response" matches. **Afterlife** and **Suicide** are off-target and
tonally grim — an artifact of emotional-tone proximity that a demo run should
glance at first.

### 8. "separating a faint signal from overwhelming noise" — Home Field: Science

Returned: Rhythm, Broadcasting, Information, Radar, Radio, Logarithm.

**Radar** is an excellent parallel — literally detecting a weak return against
noise — and **Radio** brings modulation and signal-to-noise ratio. But signal
processing sits right next to the Science Home Field, so this is a short hop, not
a distant one. **Rhythm** (hearing a beat through sound) is a nicer cross-field
pick. Broadcasting/Information are generic.

## Overall observations

The tool works end to end, and the Field-spread constraint (ADR-0003) does its
job: every page covered four or more Fields and no Parallel ever came from the
stated Home Field. Result quality is **modest but demo-viable**. WikiParallel is
at its best when the Challenge is close to something concretely named in Vital
Articles Level 3 — knowledge preservation → Oral tradition, signal-in-noise →
Radar, early failure detection → Stroke. It is at its worst on abstract
systems-thinking Challenges (decentralised coordination, resource allocation,
motivation), where the concept that would actually help — stigmergy, market
mechanisms, queueing theory, intrinsic motivation — simply is not a Level 3
article, so the ranker returns topical drift instead.

### Known weak spots

- **Corpus ceiling.** ~1,000 general-interest articles cannot cover the specific
  cross-domain analogue for most Challenges. This is the dominant limitation and
  is inherent to ADR-0002.
- **Generic-article attractors.** A few very broad articles — *Algorithm*
  (surfaced for 4 of 8 Challenges), *Information*, *Power (political science)*,
  *Anger*, *Broadcasting* — recur across unrelated Challenges. Their lead +
  headings text is broad enough to sit near almost anything.
- **Compressed Closeness.** The whole run fell in a 76–87 band, so Closeness is a
  weak ordering cue and near-useless as an absolute quality signal — consistent
  with how the term is defined, but worth remembering when presenting it.
- **Concrete beats abstract.** Challenges phrased around a concrete noun
  outperform Challenges phrased around a process or dynamic.
- **First-line evidence is sometimes junk.** The first line of a Lead Section is
  occasionally a pronunciation gloss or etymology (e.g. *"Anger, also known as
  wrath (UK: ROTH; US: RATH)…"*), which reads poorly as evidence for a Parallel.
- **Occasional tonal misfires.** Emotionally-loaded Challenges can pull in grim
  articles (*Suicide*, *Afterlife* for "recovering after a shock") — glance at
  the output before a live demo.

## Reproducing

```
npm run build      # only if corpus.json is missing
node build/eval.mjs
```
