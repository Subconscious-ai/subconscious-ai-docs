---
id: human-baselines-index
title: Human baselines
description: Published human conjoint studies replicated on the Subconscious.ai platform, with the correlation between our estimates and the original human results.
slug: /human-baselines
---

# Human baselines

Simulated respondents are only worth anything if they reproduce what humans do.
Each study below is a published human conjoint experiment, re-run on the
platform with the same attributes, levels, and design, then compared effect by
effect against the original results.

## September 2026: answer keys checked, 11 studies re-run

The public [study registry](https://fidelity.subconscious.ai/study) lists 154
runnable published conjoint experiments. In September 2026 an AI agent review
checked the human answer key of 99 of them against the original paper: the
published effects, the attributes and levels, and the design. The review
recorded 1,069 corrections, each citing a page of the paper, and escalated 2
studies for a human decision.

We then re-ran 11 corrected studies on the platform's standard fast lane
(temperature 0, fixed design seed, one run per study, measured 2026-09-27) and
scored each run's OLS effects against its corrected key.

- **Median Spearman rank correlation: 0.756** across the 11 re-runs, from 0.477
  (Donnaloja2022) to 0.947 (Kreps2020).
- **The answer key moved the score.** Rescoring the same simulated responses
  against the corrected key moved Klein2020 from 0.448 to 0.932, Blasch2013 from
  0.774 to 0.916, and Muhlbacher2016 from 0.609 to 0.798.
- **Against the 2023 replications of the same 10 studies**, the median moved
  from 0.528 to 0.750. The two differ in models, estimator (CLM in 2023, OLS
  now) and answer key, so the comparison does not isolate any one change.

Limitations: each figure is one run, and the 11 studies are the ones re-run so
far, not a random sample of the registry. A Spearman correlation over *n* levels
has a sampling standard error of about 1/√(n−1), which is 0.30 at 12 levels and
0.17 at 36. Five of the eight re-runs with a comparable earlier run scored below
that earlier run on the corrected key, each by less than one standard error.

Source: the registry's Answer key and Sept 2026 ρ columns, and the `review` and
`scores.current_replication` fields in
[studies.json](https://fidelity.subconscious.ai/studies.json).

## Earlier replications

| Study | Domain | Rank correlation |
| --- | --- | --- |
| [Adam (Patient Preferences in Complementary and Conventional Medicine)](/human-baselines/adam-patient-preferences-in-complementary-and-conventional-medicine) | Comparison of our results to the Adam et al. 2019 paper | `r_{s} = .8277, p < .001` |
| [Adida (Immigration Policy)](/human-baselines/adida-immigration-policy) | Comparison of our results to the Adida, Lo, and Platas 2019 paper | `r_{s} = .9593, p = .0002` |
| [Ares (Yogurt Consumer Choice)](/human-baselines/ares-yogurt-consumer-choice) | Comparison of our results to the Rao et al. 2009 paper | `r_{s} = .7723, p = .009` |
| [Bechtel (International Carbon Tax Policy for Environmental Mitigation)](/human-baselines/bechtel-international-carbon-tax-policy-for-environmental-mitigation) | Comparison of our results to the Bechtel, Scheve, and van Lieshout 202 | `r_{s} = .6711, p < .001` |
| [Claret (Consumer Choice for Fish)](/human-baselines/claret-consumer-choice-for-fish) | Comparison of our results to the Claret, Guerrero, and Aguirre 2012 pa | `r_{s} = .9442, p = .0002` |
| [Duch (COVID Vaccine Acceptance)](/human-baselines/duch-covid-vaccine-acceptance) | Comparison of our results to the Duch et al. 2021 paper | `r_{s}=.7996, p < .001` |
| [Hainmueller (Immigration Policy)](/human-baselines/hainmueller-immigration-policy) | Comparison of our results to the Hainmueller and Hopkins 2015 paper | `r_{s} = .5406,   p < .001` |
| [Kreps (COVID Vaccine Acceptance)](/human-baselines/kreps-covid-vaccine-acceptance) | Comparison of our results to the Kreps, Prasad, Brownstein et al. 2020 | `r_{s} = .8734, p < .001` |
| [Luthi (Wind Energy Policy)](/human-baselines/luthi-wind-energy-policy) | Comparison of our results to the Luthi and Prassler 2011 paper | `r_{s} = .7884, p = .0004` |
| [Rao (Rural Clinician Scarcity and Job Preferences)](/human-baselines/rao-rural-clinician-scarcity-and-job-preferences) | Comparison of our results to the Rao et al. 2013 paper | `r_{s} = .7286, p < .001` |
| [Skreli (Organic Tomatoes Product Design)](/human-baselines/skreli-organic-tomatoes-product-design) | Comparison of our results to the Skreli et al. 2014 paper | `r_{s} = .5213, p=.1008` |
| [Wu (Subcompact Car Product Design)](/human-baselines/wu-subcompact-car-product-design) | Comparison of our results to the Wu, Liao, and Chatwuthikrai 2014 pape | `r_{s} = .7622, p = .006` |

Each page carries the comparison chart, a link to the original paper, and a link
to the underlying run data.

:::note
Figures were produced when each replication was run and have not been
re-verified against the current platform. Treat them as the record of that
replication, not as a live benchmark.
:::
