import type { Metadata } from "next";

import { EngineerTable } from "@/components/engineer/EngineerTable";

export const metadata: Metadata = {
  title: "Engineers | PR Intelligence",
};

export default function EngineersPage() {
  return <EngineerTable />;
}
