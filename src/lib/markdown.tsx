import { Fragment, type ReactNode } from "react";

const INLINE =
  /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|__[^_\n]+__|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\)|~~[^~]+~~)/g;

const at = (lines: string[], index: number): string => lines[index] ?? "";

function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((token, index) => {
      const key = `${keyPrefix}-${index}`;
      if (/^\*\*[\s\S]+\*\*$/.test(token) || /^__[\s\S]+__$/.test(token)) {
        return (
          <strong key={key} className="font-bold text-[#14231c]">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (/^~~[\s\S]+~~$/.test(token)) {
        return (
          <s key={key} className="opacity-70">
            {token.slice(2, -2)}
          </s>
        );
      }
      if (/^`[^`\n]+`$/.test(token)) {
        return (
          <code
            key={key}
            className="rounded bg-[#eef4f0] px-1 py-0.5 font-mono text-[12px] text-[#0a3f27]"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (link) {
        return (
          <a
            key={key}
            href={link[2] ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#00662e] underline underline-offset-2"
          >
            {link[1] ?? ""}
          </a>
        );
      }
      if (/^\*[^*\n]+\*$/.test(token) || /^__[^_\n]+__$/.test(token)) {
        return (
          <em key={key} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      }
      return <Fragment key={key}>{token}</Fragment>;
    });
}

function splitRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

const isSeparator = (line: string) =>
  /^\s*\|?[\s:|-]*-{3,}[\s:|-]*\|?\s*$/.test(line) && line.includes("-");

function renderTable(lines: string[], start: number): { node: ReactNode; next: number } {
  const header = splitRow(at(lines, start));
  const aligns = splitRow(at(lines, start + 1)).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "text-center";
    if (right) return "text-right";
    return "text-left";
  });

  const body: string[][] = [];
  let i = start + 2;
  while (i < lines.length) {
    const rowLine = at(lines, i);
    if (!rowLine.includes("|") || !rowLine.trim()) break;
    body.push(splitRow(rowLine));
    i += 1;
  }

  const node = (
    <div className="my-2 overflow-x-auto rounded-lg border border-[#dce8df] shadow-[0_1px_2px_rgba(11,60,40,.05)]">
      <table className="w-full border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="bg-[#effaf2]">
            {header.map((cell, index) => (
              <th
                key={index}
                className={`border-b border-[#dce8df] px-3 py-2 font-bold text-[#0a3f27] ${
                  aligns[index] ?? "text-left"
                }`}
              >
                {renderInline(cell, `th-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 ? "bg-[#f7faf8]" : "bg-white"}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`border-b border-[#edf1ee] px-3 py-2 align-top text-[#42524a] last:border-b-0 ${
                    aligns[cellIndex] ?? "text-left"
                  }`}
                >
                  {renderInline(cell, `td-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return { node, next: i };
}

function renderList(
  lines: string[],
  start: number,
  ordered: boolean,
): { node: ReactNode; next: number } {
  const items: string[] = [];
  let i = start;
  const pattern = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
  while (i < lines.length) {
    const match = pattern.exec(at(lines, i));
    if (!match) break;
    items.push(match[1] ?? "");
    i += 1;
  }

  const node = ordered ? (
    <ol className="my-1.5 list-decimal space-y-1 pl-5 text-[13px] leading-5 text-[#42524a] marker:font-bold marker:text-[#007a33]">
      {items.map((item, index) => (
        <li key={index}>{renderInline(item, `ol-${index}`)}</li>
      ))}
    </ol>
  ) : (
    <ul className="my-1.5 list-disc space-y-1 pl-5 text-[13px] leading-5 text-[#42524a] marker:text-[#007a33]">
      {items.map((item, index) => (
        <li key={index}>{renderInline(item, `ul-${index}`)}</li>
      ))}
    </ul>
  );

  return { node, next: i };
}

function startsBlock(line: string): boolean {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    line.trim().startsWith("```")
  );
}

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = at(lines, i);

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !at(lines, i).trim().startsWith("```")) {
        body.push(at(lines, i));
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={`pre-${i}`}
          className="my-2 overflow-x-auto rounded-lg bg-[#0e2a1f] p-3 text-[12px] leading-5 text-[#d9efe2]"
        >
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = /^#+/.exec(line)?.[0].length ?? 2;
      const content = line.replace(/^#{1,6}\s+/, "");
      const size = level <= 1 ? "text-[15px]" : level === 2 ? "text-[14.5px]" : "text-[13.5px]";
      blocks.push(
        <p key={`h-${i}`} className={`mt-2 font-black text-[#0e2a1f] ${size}`}>
          {renderInline(content, `h-${i}`)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (/^\s*\|/.test(line) && i + 1 < lines.length && isSeparator(at(lines, i + 1))) {
      const { node, next } = renderTable(lines, i);
      blocks.push(<Fragment key={`t-${i}`}>{node}</Fragment>);
      i = next;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const { node, next } = renderList(lines, i, false);
      blocks.push(<Fragment key={`ul-${i}`}>{node}</Fragment>);
      i = next;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const { node, next } = renderList(lines, i, true);
      blocks.push(<Fragment key={`ol-${i}`}>{node}</Fragment>);
      i = next;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(at(lines, i))) {
        quote.push(at(lines, i).replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`q-${i}`}
          className="my-2 border-l-4 border-[#8fc5a0] bg-[#f2f8f4] px-3 py-2 text-[13px] leading-5 text-[#42524a]"
        >
          {quote.map((row, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {renderInline(row, `q-${i}-${index}`)}
            </Fragment>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${i}`} className="my-3 border-[#e5ece7]" />);
      i += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const paragraphLine = at(lines, i);
      if (!paragraphLine.trim() || startsBlock(paragraphLine)) break;
      if (/^\s*\|/.test(paragraphLine) && i + 1 < lines.length && isSeparator(at(lines, i + 1))) {
        break;
      }
      paragraph.push(paragraphLine);
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className="my-1.5 leading-5 text-[#42524a]">
        {paragraph.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {renderInline(row, `p-${i}-${index}`)}
          </Fragment>
        ))}
      </p>,
    );
  }

  return <div className={`text-[13px] ${className}`}>{blocks}</div>;
}
