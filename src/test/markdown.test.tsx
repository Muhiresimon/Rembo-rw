import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "@/lib/markdown";

describe("Markdown", () => {
  it("renders a GFM table with header and cells", () => {
    const text = [
      "Compare the two documents:",
      "",
      "| Requirement | Child passport | Birth certificate |",
      "| :--- | :---: | ---: |",
      "| **Documents** | ID + photo | Notification of birth |",
      "| Fee | 25,000 RWF | 1,500 RWF |",
      "",
      "Always confirm fees on **irembo.gov.rw**.",
    ].join("\n");

    render(<Markdown text={text} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("irembo.gov.rw")).toBeInTheDocument();
    expect(screen.getByText("25,000 RWF")).toBeInTheDocument();
    expect(screen.getByText("Notification of birth")).toBeInTheDocument();
  });

  it("renders bold, code, lists and headings", () => {
    render(<Markdown text={"## Steps\n- **Get** the `ID`\n1. First\n2. Second"} />);

    expect(screen.getByText("Steps")).toBeInTheDocument();
    expect(screen.getByText("Get")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
