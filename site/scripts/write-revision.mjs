import {execFileSync} from "node:child_process";
import {mkdir, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const REPOSITORY = "Subconscious-ai/subconscious-ai-docs";
const OUTPUT_PATH = new URL("../static/revision.json", import.meta.url);

export function resolveRevision(env, gitHead) {
  const revision =
    env.DOCS_SOURCE_REVISION ??
    env.VERCEL_GIT_COMMIT_SHA ??
    env.GITHUB_SHA ??
    gitHead;

  if (!/^[0-9a-f]{40}$/i.test(revision ?? "")) {
    throw new Error("A 40-character Git SHA is required to build the docs");
  }
  return revision.toLowerCase();
}

export function revisionDocument(revision) {
  return {
    repository: REPOSITORY,
    revision,
  };
}

export async function writeRevision({
  env = process.env,
  gitHead = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  outputPath = OUTPUT_PATH,
} = {}) {
  const revision = resolveRevision(env, gitHead);
  const document = revisionDocument(revision);
  await mkdir(dirname(fileURLToPath(outputPath)), {recursive: true});
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  return document;
}

async function main() {
  const document = await writeRevision();
  console.log(`Wrote static/revision.json (${document.revision})`);
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  await main();
}
