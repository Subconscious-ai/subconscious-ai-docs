import React, { useState } from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

const studies = [
  {
    discipline: "Economics",
    question: "What makes a job worth taking?",
    context:
      "Compare compensation, flexibility, and commute in a job-choice experiment.",
    attributes: ["Annual salary", "Working arrangement", "Commute each way"],
    a: ["$70,000", "Three days at home", "45 minutes"],
    b: ["$80,000", "Five days in office", "20 minutes"],
    interpretation:
      "Estimate how modeled job preference changes within the salary and working conditions you test.",
    boundary:
      "This does not estimate labor-market wages or actual job acceptance.",
    anchor: "economics",
  },
  {
    discipline: "Sociology",
    question: "Which housing proposal earns support?",
    context:
      "Vary features of a housing proposal to study a defined community’s trade-offs.",
    attributes: ["Affordable homes", "Building height", "Public transport"],
    a: ["40% of homes", "Eight floors", "Five-minute walk"],
    b: ["20% of homes", "Four floors", "Fifteen-minute walk"],
    interpretation:
      "Compare modeled support across the policy features included in the design.",
    boundary:
      "Synthetic preferences do not establish community consent or predict a vote.",
    anchor: "sociology",
  },
  {
    discipline: "Psychology",
    question: "What encourages someone to seek support?",
    context:
      "Compare service features in a hypothetical choice about seeking counseling.",
    attributes: ["First appointment", "Session format", "Cost per session"],
    a: ["Within one week", "Video call", "$40"],
    b: ["Within one month", "In person", "$15"],
    interpretation:
      "Study modeled service preference under the conditions in the choice task.",
    boundary:
      "This is not a clinical assessment or evidence of treatment effectiveness.",
    anchor: "psychology",
  },
];

export default function ResearchLanding() {
  const [active, setActive] = useState(0);
  const study = studies[active];
  return (
    <div className={`researchLanding ${styles.landing}`}>
      <header className={styles.hero}>
        <p className={styles.kicker}>A field guide to synthetic experiments</p>
        <h1>
          Human behavior.
          <br />A question at a time.
        </h1>
        <p className={styles.intro}>
          Turn a research question into a choice experiment. Run it with
          synthetic respondents. Understand what the evidence can tell you.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to="/guides/research-design">
            Design your first study
          </Link>
          <Link to="/get-started/quickstart">Start with the API</Link>
        </div>
        <p className={styles.audience}>
          For researchers in economics, sociology, and psychology.
        </p>
      </header>
      <section className={styles.example} aria-labelledby="example-heading">
        <div className={styles.exampleIntro}>
          <p className={styles.kicker}>Explore a choice task</p>
          <div className={styles.disciplines} aria-label="Example discipline">
            {studies.map((item, index) => (
              <button
                key={item.discipline}
                type="button"
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                {item.discipline}
              </button>
            ))}
          </div>
          <h2 id="example-heading">{study.question}</h2>
          <p>{study.context}</p>
          <p className={styles.caption}>
            Illustrative design. No experiment is running and no responses are
            collected.
          </p>
        </div>
        <div className={styles.choice}>
          <table aria-label={`${study.discipline} illustrative choice task`}>
            <thead>
              <tr>
                <th scope="col">Attribute</th>
                <th scope="col">Option A</th>
                <th scope="col">Option B</th>
              </tr>
            </thead>
            <tbody>
              {study.attributes.map((attribute, i) => (
                <tr key={attribute}>
                  <th scope="row">{attribute}</th>
                  <td>{study.a[i]}</td>
                  <td>{study.b[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.interpretation}>
            <p>
              <strong>What you could learn</strong>
              <br />
              {study.interpretation}
            </p>
            <p className={styles.caption}>{study.boundary}</p>
            <Link to={`/guides/research-design#${study.anchor}`}>
              Build this study design
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.journey} aria-labelledby="journey-heading">
        <h2 id="journey-heading">A path from question to interpretation.</h2>
        <ol>
          {[
            [
              "Define the decision",
              "Name the chooser, the alternatives, and the result that would change your mind.",
              "/guides/research-design",
            ],
            [
              "Design the comparison",
              "Select a population and vary realistic attributes without changing the question halfway through.",
              "/guides/design-a-population",
            ],
            [
              "Run and keep the record",
              "Review cost and privacy, retain the run ID, and record the settings needed to repeat the study.",
              "/guides/reproducible-runs",
            ],
            [
              "Interpret with care",
              "Read effects within the tested design. Check uncertainty and compare with relevant human evidence.",
              "/concepts/methodology",
            ],
          ].map(([title, body, to]) => (
            <li key={title}>
              <Link to={to}>{title}</Link>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.entryPoints} aria-labelledby="entry-heading">
        <h2 id="entry-heading">Work the way you research.</h2>
        <div>
          <article>
            <h3>In the browser</h3>
            <p>
              Follow the experiment builder from a question through population,
              design, and results.
            </p>
            <Link to="/guides/from-question-to-decision">
              Use the visual workflow
            </Link>
          </article>
          <article>
            <h3>In your analysis code</h3>
            <p>
              Use a Python workflow or look up exact request fields, defaults,
              responses, and errors.
            </p>
            <Link to="/guides/python-workflow">Run with Python</Link>
            <Link to="/api-reference/superego">Read the API reference</Link>
          </article>
          <article>
            <h3>With an assistant</h3>
            <p>
              Connect an MCP client, review the design, and make the decision to
              launch explicit.
            </p>
            <Link to="/guides/mcp-server">Connect through MCP</Link>
          </article>
        </div>
      </section>
      <section className={styles.evidence} aria-labelledby="evidence-heading">
        <div>
          <h2 id="evidence-heading">
            Synthetic responses.
            <br />
            Explicit limits.
          </h2>
          <p>
            These experiments measure model responses to a design. They are not
            observations of people. A useful finding still needs a justified
            population, a defensible comparison, and validation appropriate to
            the decision.
          </p>
        </div>
        <div>
          <Link to="/concepts/methodology#research-validity-checklist">
            Read the research validity checklist
          </Link>
          <Link to="/human-baselines">Explore human-baseline studies</Link>
          <p className={styles.caption}>
            A benchmark supports the study and metric it measures. It does not
            certify every new population or research question.
          </p>
        </div>
      </section>
    </div>
  );
}
