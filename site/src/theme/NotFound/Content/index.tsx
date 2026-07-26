import React from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import type { Props } from "@theme/NotFound/Content";

/**
 * A useful 404.
 *
 * This site absorbed two retired documentation systems, so inbound links from
 * Fern, GitBook and the old Mintlify pages will rot for years. The default
 * Docusaurus 404 is a dead end; this one routes people onward.
 */
export default function NotFoundContent({ className }: Props): React.JSX.Element {
  return (
    <main className={className}>
      <div className="container margin-vert--xl">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h1">Page not found</Heading>
            <p>
              This page moved or never existed. Documentation from our older
              Fern and GitBook sites now lives here under different addresses.
            </p>
            <p>
              <strong>Try search</strong> (press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+
              <kbd>K</kbd>), or start from one of these:
            </p>
            <ul>
              <li>
                <Link to="/get-started/quickstart">Quickstart</Link> — make your
                first API call
              </li>
              <li>
                <Link to="/api-reference/superego">API reference</Link> — every
                published endpoint
              </li>
              <li>
                <Link to="/human-baselines">Human baselines</Link> — replicated
                studies
              </li>
              <li>
                <Link to="/">Documentation home</Link>
              </li>
            </ul>
            <p>
              If you followed a link from our own site or docs,{" "}
              <Link to="/support/contact">tell us</Link> — that is a bug worth
              fixing.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
