# Cross-field retrieval: Home Field exclusion plus forced Field spread

To deliver "ideas from completely different fields", the ranker does two things
beyond a nearest-neighbour lookup: it excludes every article in the person's
selected Home Field entirely, and it caps the returned Parallels at 2 per Field
with at least 4 different Fields represented in each set of 6.

This is deliberate, not an optimisation we can drop. The analogy-retrieval
literature (Forbus, Gentner & Law's MAC/FAC) and our own reasoning agree that
plain embedding similarity returns topical neighbours in the same domain: a
Challenge about a "surge of users" pulls back load balancing and networking
before it pulls back locust swarms or bank runs. Without Home Field exclusion and
the spread constraint, WikiParallel would just be a generic semantic search over
1,000 articles, which is not the product. The trade-off is that we sometimes
push aside a genuinely strong same-Field match in favour of a weaker but more
distant one; for a brainstorming tool that is the behaviour we want.
