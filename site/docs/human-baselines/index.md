---
id: human-baselines-index
title: Human baselines
description: Published human conjoint studies replicated with synthetic respondents, scored level by level against the original human results, with the measured human ceiling and noise floor.
slug: /human-baselines
---

# Human baselines

Simulated respondents are only worth anything if they reproduce what humans do.
Each study below is a published human conjoint experiment. We re-run it with
synthetic respondents, estimate the same average marginal component effects
(AMCEs) the paper reports, and compare them level by level.

![Human AMCE against synthetic AMCE, one panel per Golden-10 study, 95% intervals on both axes](/img/human-baselines/xy_levels_2026-07-27.png)

Each dot is one attribute level. The horizontal bar is the paper's own 95%
interval for that level; the vertical bar is the synthetic estimate's
cluster-robust 95% interval. A study whose rank correlation cannot be told
apart from zero is titled in red: that is a failure of correlation, not a low
score. The rows behind this figure, with the same two intervals, are the
`levels` table on the cohort evaluation run in Weights & Biases, where they can
be grouped by research domain, design, or estimator.

## How to read the score

- **Spearman rho** ranks the paper's AMCEs and the synthetic AMCEs and asks how
  well the two orders agree. 1.0 is the paper itself.
- **The human ceiling is not 1.0.** Two random halves of the same human sample
  agree at about 0.91 to 0.96 on Hainmueller 2015 (split-half 0.923,
  Spearman-Brown 0.960, 0.909 at a matched 2,000-task budget). A synthetic
  panel at or above that line is indistinguishable from humans by this metric.
- **Normalized accuracy** is rho divided by the human ceiling, the convention
  used by Park et al. 2024 and Twin-2K-500. We report it wherever a ceiling has
  been measured.
- **Noise floor.** Two same-design synthetic runs differ by about 0.025 at
  1,500 choices and 0.009 at 6,000. Differences smaller than that are not
  evidence.

## The Golden-15 (benchmark of record since 2026-09-06)

The Golden-10 below was assembled from source-validated studies. The Golden-15 replaces it
as the benchmark of record and is chosen on the quality of the human study alone: the source
PDF is confirmed to be the paper, it is a real choice experiment, the paper's own analytic N
is at least 500, at least ten published coefficients are numeric, and the paper states both
the opt-out and the tasks per respondent. Qualifying studies are ranked by human N. No
fidelity score, historic or current, enters the selection, so a good score on this set cannot
come from picking the studies we already matched.

| # | Study | Human N | Numeric coefs | Options/task | Opt-out | Tasks |
|---|---|---|---|---|---|---|
| 1 | Duch2021 | 15,536 | 16 | 2 | no | 8 |
| 2 | Argote2021 | 6,489 | 13 | 1 (single profile) | no | 5 |
| 3 | Muhlbacher2016 | 3,900 | 19 | 2 | no | 15 |
| 4 | LiuR2019 | 2,092 | 31 | 3 | yes | 12 |
| 5 | Kreps2020 | 1,971 | 12 | 2 | yes | 5 |
| 6 | Leng2021 | 1,883 | 13 | 2 | no | 8 |
| 7 | Klein2020 | 1,673 | 20 | 3 | yes | 10 |
| 8 | Donnaloja2022 | 1,597 | 14 | 2 | yes | 5 |
| 9 | BROOKS2010 | 1,552 | 18 | 4 | yes | 16 |
| 10 | Klaiman2016 | 1,500 | 33 | 4 | yes | 5 |
| 11 | Wu2015 | 1,489 | 11 | 3 | yes | 12 |
| 12 | Hainmueller2014 | 1,407 | 14 | 2 | no | 5 |
| 13 | Jankowski2021 | 1,274 | 34 | 2 | no | 6 |
| 14 | Blasch2013 | 1,010 | 70 | 3 | yes | 8 |
| 15 | Motta2021 | 990 | 12 | 3 | no | 2 |

Eight of the fifteen are not two-option tasks; those run through the v2 replication runner
until the platform can state the number of alternatives per task. The rule, the full ranked
list of twenty-eight qualifying studies, and every score come from the `Subconscious-ai/Ditto`
repository (`docs/golden-15.md`, `data/golden15_candidates.csv`).

## The Golden-10 (frozen canary)

Ten source-validated studies form the standing benchmark. Two synthetic eras are
shown: the production platform run of 2026-07-27 (one run per study, each
paper's own headline estimator) and the v2 replication runner of 2026-09-05,
which runs the paper's design verbatim from a page-cited record (question,
task count, alternatives, opt-out) with no personas.

| Study | Design as the humans saw it | Human N | 2026-07 platform rho | 2026-09 v2 rho |
| --- | --- | ---: | ---: | ---: |
| [Kreps 2020](https://doi.org/10.1001/jamanetworkopen.2020.25594), COVID-19 vaccine acceptance, US | 2 vaccines + neither, 5 tasks | 1,971 | 0.91 | 0.82 |
| [Leng 2021](https://doi.org/10.1016/j.vaccine.2020.12.009), COVID-19 vaccination, China | forced choice, 8 tasks | 1,883 | 0.84 | – |
| [Adida 2019](https://doi.org/10.1371/journal.pone.0222504), Syrian refugee admission, US | 2 profiles, 1-7 rating, 3 tasks | 1,800 | – | – |
| [Donnaloja 2022](https://doi.org/10.1093/esr/jcab034), citizenship preferences, UK | grant or deny each of 2, 5 tasks | 1,597 | – | 0.64 |
| [Hainmueller 2015](https://doi.org/10.1111/ajps.12138), immigrant admission, US | forced choice, 5 tasks | 1,407 | 0.69 | 0.85 / 0.94 |
| [Humburg 2015](https://doi.org/10.1016/j.econedurev.2015.07.001), graduate recruitment, Europe | 3 candidates + none, 10 tasks | 903 | 0.76 | – |
| [Spilker 2018](https://doi.org/10.1080/03050629.2018.1436316), trade agreements, Nicaragua | forced choice, 5 tasks | 800 | 0.38 | – |
| [Hainmueller, Hopkins, Yamamoto 2014](https://doi.org/10.1093/pan/mpt024), candidate choice, US | forced choice, 6 tasks | 311 | 0.23 | – |
| [Eliasson 2017](https://doi.org/10.1016/j.clinthera.2017.02.009), prostate cancer treatment, FR/DE/UK | forced choice, 18 tasks | 285 | 0.86 | – |
| [Schweizer 2012](https://doi.org/10.1016/j.scaman.2012.02.003), post-acquisition commitment, EU/US | single-profile 7-point rating, 32 profiles | 91 | 0.92 | – |

Hainmueller 2015 is the one study with a measured human ceiling (0.909 at the
matched budget): the two v2 runs score 0.85 and 0.94, a normalized accuracy of
0.94 and 1.03. The v2 rows fill in as runs complete.

## What the platform run got wrong, and why the v2 runner exists

An audit of all ten transcriptions against the source papers (2026-09-01) found
73 material mismatches, almost all in design fields rather than coefficients:
tasks per respondent was encoded in none of the ten, the choice set (forced
choice versus an opt-out) was wrong or unaudited in nine, and the published
standard-error column held a confidence-interval half-width in six. The
production platform also adds a "none of these" option to every conjoint,
which only 7 of 16 re-extracted papers offered. The v2 runner exists to remove
those design differences so that what remains is the respondents.

## Historical replications (2024)

These figures were produced when each replication was first run and have not
been re-verified against the current platform. Each page carries the original
comparison chart and links to the paper and the run.

| Study | Rank correlation |
| --- | --- |
| [Adam (Patient Preferences in Complementary and Conventional Medicine)](/human-baselines/adam-patient-preferences-in-complementary-and-conventional-medicine) | `r_{s} = .8277, p < .001` |
| [Adida (Immigration Policy)](/human-baselines/adida-immigration-policy) | `r_{s} = .9593, p = .0002` |
| [Ares (Yogurt Consumer Choice)](/human-baselines/ares-yogurt-consumer-choice) | `r_{s} = .7723, p = .009` |
| [Bechtel (International Carbon Tax Policy for Environmental Mitigation)](/human-baselines/bechtel-international-carbon-tax-policy-for-environmental-mitigation) | `r_{s} = .6711, p < .001` |
| [Claret (Consumer Choice for Fish)](/human-baselines/claret-consumer-choice-for-fish) | `r_{s} = .9442, p = .0002` |
| [Duch (COVID Vaccine Acceptance)](/human-baselines/duch-covid-vaccine-acceptance) | `r_{s}=.7996, p < .001` |
| [Hainmueller (Immigration Policy)](/human-baselines/hainmueller-immigration-policy) | `r_{s} = .5406,   p < .001` |
| [Kreps (COVID Vaccine Acceptance)](/human-baselines/kreps-covid-vaccine-acceptance) | `r_{s} = .8734, p < .001` |
| [Luthi (Wind Energy Policy)](/human-baselines/luthi-wind-energy-policy) | `r_{s} = .7884, p = .0004` |
| [Rao (Rural Clinician Scarcity and Job Preferences)](/human-baselines/rao-rural-clinician-scarcity-and-job-preferences) | `r_{s} = .7286, p < .001` |
| [Skreli (Organic Tomatoes Product Design)](/human-baselines/skreli-organic-tomatoes-product-design) | `r_{s} = .5213, p=.1008` |
| [Wu (Subcompact Car Product Design)](/human-baselines/wu-subcompact-car-product-design) | `r_{s} = .7622, p = .006` |

## Sources

Every number above is a generated view over three records kept in the
`Subconscious-ai/Ditto` repository: the human reference (transcription plus
page-cited evidence), the synthetic replication (a Weights & Biases run), and
the fidelity score written back onto that run. The audit is Ditto issue #312;
the noise floor and model ranking are Ditto PR #311; the human ceiling is
Ditto PR #269.
