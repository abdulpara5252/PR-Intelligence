import type { Metadata } from "next";

import { EngineerProfile } from "@/components/engineer/EngineerProfile";

export const metadata: Metadata = {
  title: "Engineer Profile | PR Intelligence",
};

interface EngineerProfilePageProps {
  params: Promise<{ login: string }>;
}

export default async function EngineerProfilePage({
  params,
}: EngineerProfilePageProps) {
  const { login } = await params;
  return <EngineerProfile login={login} />;
}
