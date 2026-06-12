import { gql } from "@apollo/client";

export const GET_PRS = gql`
  query GetPRs(
    $repo: String
    $author: String
    $state: String
    $page: Int
    $limit: Int
  ) {
    prs(repo: $repo, author: $author, state: $state, page: $page, limit: $limit) {
      id
      externalId
      repoFullName
      title
      authorLogin
      state
      isDraft
      additions
      deletions
      changedFiles
      createdAt
      mergedAt
      metrics {
        cycleTimeHours
        reviewCount
        approvalCount
        riskScore
      }
    }
  }
`;

export const GET_PR_DETAIL = gql`
  query GetPRDetail($id: String!) {
    prWithInsight(id: $id) {
      id
      externalId
      repoFullName
      title
      body
      authorLogin
      state
      isDraft
      additions
      deletions
      changedFiles
      commits
      htmlUrl
      createdAt
      mergedAt
      metrics {
        cycleTimeHours
        reviewTimeHours
        reviewCount
        approvalCount
        commentCount
        riskScore
        hasTestChanges
      }
      reviews {
        reviewerLogin
        state
        body
        submittedAt
      }
      aiInsight {
        summary
        riskFlags
        generatedAt
      }
    }
  }
`;

export const GET_ENGINEERS = gql`
  query GetEngineers($page: Int, $limit: Int) {
    engineers(page: $page, limit: $limit) {
      login
      name
      avatarUrl
      totalPRs
      totalReviews
      avgCycleTimeHours
      avgRiskScore
      reviewParticipation
    }
  }
`;

export const GET_ENGINEER_PROFILE = gql`
  query GetEngineerProfile($login: String!) {
    engineer(login: $login) {
      login
      name
      avatarUrl
      totalPRs
      mergedPRs
      totalReviews
      avgCycleTimeHours
      avgRiskScore
      reviewParticipation
    }
    prs(author: $login, limit: 10) {
      id
      externalId
      title
      state
      repoFullName
      createdAt
      mergedAt
      metrics {
        cycleTimeHours
        riskScore
        reviewCount
      }
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      login
      name
      avatarUrl
      totalPRs
      mergedPRs
      totalReviews
      avgCycleTimeHours
      reviewParticipation
    }
  }
`;
