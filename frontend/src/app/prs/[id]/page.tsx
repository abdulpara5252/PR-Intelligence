import type { Metadata } from "next";

import { PRDetail } from "@/components/pr/PRDetail";

export const metadata: Metadata = {
  title: "PR Detail | PR Intelligence",
};

interface PRDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PRDetailPage({ params }: PRDetailPageProps) {
  const { id } = await params;
  return <PRDetail id={id} />;
}
