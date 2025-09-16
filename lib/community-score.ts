export interface CommunityLevel {
  name: string
  minScore: number
  maxScore: number
  color: string
  benefits: string[]
}

export const COMMUNITY_LEVELS: CommunityLevel[] = [
  {
    name: "Newcomer",
    minScore: 0,
    maxScore: 24,
    color: "bg-gray-100 text-gray-800",
    benefits: ["Welcome to the community!", "Access to basic features"],
  },
  {
    name: "Helper",
    minScore: 25,
    maxScore: 49,
    color: "bg-blue-100 text-blue-800",
    benefits: ["Priority support", "Helper badge", "Access to helper resources"],
  },
  {
    name: "Contributor",
    minScore: 50,
    maxScore: 99,
    color: "bg-green-100 text-green-800",
    benefits: ["Contributor badge", "Event creation privileges", "Featured posts"],
  },
  {
    name: "Champion",
    minScore: 100,
    maxScore: 199,
    color: "bg-purple-100 text-purple-800",
    benefits: ["Champion badge", "Moderation privileges", "Exclusive events"],
  },
  {
    name: "Legend",
    minScore: 200,
    maxScore: Number.POSITIVE_INFINITY,
    color: "bg-yellow-100 text-yellow-800",
    benefits: ["Legend status", "All privileges", "Community leadership"],
  },
]

export function getCommunityLevel(score: number): CommunityLevel {
  return COMMUNITY_LEVELS.find((level) => score >= level.minScore && score <= level.maxScore) || COMMUNITY_LEVELS[0]
}

export function getScoreLevel(score: number): CommunityLevel {
  return getCommunityLevel(score)
}

export function getProgressToNextLevel(score: number): number {
  const currentLevel = getCommunityLevel(score)
  const nextLevel = COMMUNITY_LEVELS.find((level) => level.minScore > currentLevel.maxScore)

  if (!nextLevel) {
    return 100 // Already at max level
  }

  const progressInCurrentLevel = score - currentLevel.minScore
  const totalPointsNeededForNextLevel = nextLevel.minScore - currentLevel.minScore

  return Math.min(100, (progressInCurrentLevel / totalPointsNeededForNextLevel) * 100)
}

export function getPointsToNextLevel(score: number): number {
  const currentLevel = getCommunityLevel(score)
  const nextLevel = COMMUNITY_LEVELS.find((level) => level.minScore > currentLevel.maxScore)

  if (!nextLevel) {
    return 0 // Already at max level
  }

  return nextLevel.minScore - score
}

export function calculateScoreForAction(action: string): number {
  const scoreMap: Record<string, number> = {
    help_post_created: 5,
    help_post_completed: 10,
    event_created: 15,
    event_attended: 3,
    forum_post_created: 2,
    comment_added: 1,
    like_received: 1,
  }

  return scoreMap[action] || 0
}
