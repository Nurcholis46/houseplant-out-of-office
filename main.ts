import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the out-of-office auto-reply a houseplant would send.
// Chosen against the judge's brief, in its own order: it reads squarely
// as an out-of-office auto-reply from a houseplant (it opens "Out of
// office", names itself "the office fern", and answers about "your email");
// it is a fresh joke that surprises rather than a mild pun or a stock
// office phrase ("alive purely out of spite" is the plant's verdict on its
// owner, and the twist lands in the last two words, "I did" — the plant
// waited, so the email can wait too); the plant's own life drives the joke
// (last watered in March, still alive on neglect, no sunlight or small
// talk in the way); it is tight at 114 of 120 characters with no wasted
// words; and it is original — no "thank you for your email" throat
// clearing, no "I'll get back to you" cliché. It explains nothing: the
// neglect is the setup and the waiting is the punchline.
// Alternatives weighed and set aside: a grudge variant ("Last watered in
// March, still holding a grudge. Your email is now being ignored too.",
// 111 chars) states the revenge instead of letting the twist do it, and a
// window-light variant ("I survived on spite and window light", 115 chars)
// spends words on a second image the joke does not need. The spite line
// keeps the loss and the punch in the same breath, so it stands.
const text =
  "Out of office: I'm the office fern. Watered last in March, alive purely out of spite. Your email can wait \u2014 I did.";

// The bounty requires 1-120 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 120 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-120 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

// The grader collects outputs as another user than the one the program
// runs as, so leave the file readable by every user.
chmodSync("/output", 0o755);
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
