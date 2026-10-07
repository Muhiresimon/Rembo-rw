import { createFileRoute } from "@tanstack/react-router";
import { RemboPage } from "@/components/RemboPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RemboRw | Rwanda government services without the queue" },
      {
        name: "description",
        content:
          "An independent Rwanda-focused concierge for understanding, preparing, submitting and tracking government e-services.",
      },
      { property: "og:title", content: "RemboRw | Rwanda government services without the queue" },
      {
        property: "og:description",
        content: "Understand, prepare, submit and track Rwanda government e-services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RemboPage,
});
