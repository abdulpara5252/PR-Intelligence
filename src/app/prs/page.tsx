import type { Metadata } from "next";

import { PRListClient } from "@/components/pr/PRListClient";

export const metadata: Metadata = {
  title: "Pull Requests | PR Intelligence",
};

export default function PRsPage() {
  return <PRListClient />;
}
