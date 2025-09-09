import { NPSData } from '@/types'

// NPS calculation constants
export const NPS_CONSTANTS = {
  PROMOTER_MIN: 9,
  PROMOTER_MAX: 10,
  PASSIVE_MIN: 7,
  PASSIVE_MAX: 8,
  DETRACTOR_MIN: 0,
  DETRACTOR_MAX: 6,
}

// Calculate NPS score from individual responses
export const calculateNPSFromResponses = (responses: number[]): NPSData => {
  const total = responses.length
  if (total === 0) {
    return {
      promoters: 0,
      passives: 0,
      detractors: 0,
      total_responses: 0,
      nps_score: 0,
    }
  }

  const promoters = responses.filter(
    score => score >= NPS_CONSTANTS.PROMOTER_MIN && score <= NPS_CONSTANTS.PROMOTER_MAX
  ).length

  const passives = responses.filter(
    score => score >= NPS_CONSTANTS.PASSIVE_MIN && score <= NPS_CONSTANTS.PASSIVE_MAX
  ).length

  const detractors = responses.filter(
    score => score >= NPS_CONSTANTS.DETRACTOR_MIN && score <= NPS_CONSTANTS.DETRACTOR_MAX
  ).length

  const npsScore = ((promoters - detractors) / total) * 100

  return {
    promoters,
    passives,
    detractors,
    total_responses: total,
    nps_score: Math.round(npsScore),
  }
}

// Calculate NPS score from field responses
export const calculateNPSFromFieldResponses = (responses: any[], fieldId: string): NPSData => {
  const npsResponses = responses
    .filter(response => response.field_id === fieldId)
    .map(response => Number(response.value))
    .filter(score => !isNaN(score) && score >= 0 && score <= 10)

  return calculateNPSFromResponses(npsResponses)
}

// Get NPS category for a score
export const getNPSCategory = (score: number): 'promoter' | 'passive' | 'detractor' => {
  if (score >= NPS_CONSTANTS.PROMOTER_MIN && score <= NPS_CONSTANTS.PROMOTER_MAX) {
    return 'promoter'
  } else if (score >= NPS_CONSTANTS.PASSIVE_MIN && score <= NPS_CONSTANTS.PASSIVE_MAX) {
    return 'passive'
  } else {
    return 'detractor'
  }
}

// Get NPS category color
export const getNPSCategoryColor = (category: 'promoter' | 'passive' | 'detractor'): string => {
  switch (category) {
    case 'promoter':
      return 'text-green-600'
    case 'passive':
      return 'text-yellow-600'
    case 'detractor':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Get NPS category background color
export const getNPSCategoryBgColor = (category: 'promoter' | 'passive' | 'detractor'): string => {
  switch (category) {
    case 'promoter':
      return 'bg-green-100'
    case 'passive':
      return 'bg-yellow-100'
    case 'detractor':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}

// Get NPS score color
export const getNPSScoreColor = (score: number): string => {
  if (score >= 50) return 'text-green-600'
  if (score >= 0) return 'text-yellow-600'
  return 'text-red-600'
}

// Get NPS score description
export const getNPSScoreDescription = (score: number): string => {
  if (score >= 70) return 'Excellent'
  if (score >= 50) return 'Good'
  if (score >= 0) return 'Average'
  return 'Poor'
}

// Validate NPS score
export const isValidNPSScore = (score: number): boolean => {
  return !isNaN(score) && score >= 0 && score <= 10 && Number.isInteger(score)
}

// Format NPS score for display
export const formatNPSScore = (score: number): string => {
  return `${score}`
}

// Get NPS distribution percentages
export const getNPSDistribution = (npsData: NPSData) => {
  const { promoters, passives, detractors, total_responses } = npsData

  if (total_responses === 0) {
    return {
      promoterPercentage: 0,
      passivePercentage: 0,
      detractorPercentage: 0,
    }
  }

  return {
    promoterPercentage: Math.round((promoters / total_responses) * 100),
    passivePercentage: Math.round((passives / total_responses) * 100),
    detractorPercentage: Math.round((detractors / total_responses) * 100),
  }
}

// Get NPS insights
export const getNPSInsights = (npsData: NPSData): string[] => {
  const insights: string[] = []
  const { nps_score, total_responses, promoters, passives, detractors } = npsData

  if (total_responses === 0) {
    return ['No responses yet']
  }

  // Overall score insights
  if (nps_score >= 70) {
    insights.push('Excellent NPS score! Your customers are highly satisfied.')
  } else if (nps_score >= 50) {
    insights.push('Good NPS score. There\'s room for improvement.')
  } else if (nps_score >= 0) {
    insights.push('Average NPS score. Consider addressing customer concerns.')
  } else {
    insights.push('Low NPS score. Immediate attention needed to improve customer satisfaction.')
  }

  // Response distribution insights
  const promoterPercentage = (promoters / total_responses) * 100
  const detractorPercentage = (detractors / total_responses) * 100

  if (promoterPercentage >= 70) {
    insights.push('High promoter percentage indicates strong customer loyalty.')
  } else if (promoterPercentage < 30) {
    insights.push('Low promoter percentage suggests need for product/service improvements.')
  }

  if (detractorPercentage > 20) {
    insights.push('High detractor percentage indicates significant customer dissatisfaction.')
  }

  // Response volume insights
  if (total_responses < 10) {
    insights.push('Consider collecting more responses for more reliable insights.')
  }

  return insights
} 