---
id: human-baselines
title: Human baselines
description: How Subconscious.ai validates simulated respondents against replicated human conjoint studies.
---

# Human baselines

Simulated respondents are only worth anything if they reproduce what humans do.
Human baselines are how that gets checked, rather than asserted.

## The method

Take a published human conjoint study. Re-run it on the platform with the same
attributes, levels, and design. Compare the estimated effects against the
original human results.

If the simulated AMCEs track the human AMCEs — same direction, comparable
magnitude, same ranking of what matters — the platform reproduces that study.
Where they diverge, that is a finding too, and a bound on what the platform
should be trusted for.

## Through the API

Baseline replications and their AMCEs are available:

```bash
curl "$SUBCONSCIOUS_API/api/v1/human-baselines/$HB_FOLDER/replications-amces" \
  -H "Authorization: Bearer $SUBCONSCIOUS_TOKEN"
```

You can also run baselines in batch, and transcribe a study from a PDF to set
one up. See the [API reference](/api-reference/superego).

## How to use this

When you present a result to someone who has not seen the platform before, the
question is always "why should I believe this?" The honest answer is the
replication record: here are published human studies, here is what the platform
produced for them, here is how closely they agree.

That record is also the right place to check before running in a new domain.
Replication in one area is evidence, not a guarantee, for another.
