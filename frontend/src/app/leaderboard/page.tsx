import type { Metadata } from "next";

import { Leaderboard } from "@/components/leaderboard/Leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard | PR Intelligence",
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
