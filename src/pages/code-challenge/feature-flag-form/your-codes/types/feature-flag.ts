export type ValueType = 'boolean' | 'string' | 'number' | 'json'
export type RuleOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not in'
  | 'contains'
export type GroupOperator = 'AND' | 'OR'

export interface Variation {
  name: string
  value: boolean | string | number | Record<string, unknown>
}

export interface TargetCondition {
  id: string
  kind: 'condition'
  attribute: string
  operator: RuleOperator
  value: string
}

export interface TargetGroup {
  id: string
  kind: 'group'
  operator: GroupOperator
  children: unknown[]
}

export type TargetNode = TargetCondition | TargetGroup

export interface TargetingRule {
  id: string
  name: string
  role: string
  conditions: TargetGroup
  percentage: number
  variation: string
}

export interface FeatureFlagValues {
  flagKey: string
  description: string
  version: string
  enabled: boolean
  trackEvents: boolean
  valueType: ValueType
  variations: Variation[]
  defaultVariation: string
  targeting: TargetingRule[]
  metadata: { key: string; value: string }[]
}
