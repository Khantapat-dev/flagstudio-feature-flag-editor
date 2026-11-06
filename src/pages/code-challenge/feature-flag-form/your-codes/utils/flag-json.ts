import type { FeatureFlagValues, TargetNode } from '../types/feature-flag'

function quote(value: string) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

export function buildTargetQuery(node: TargetNode): string {
  if (node.kind === 'condition') {
    const right =
      node.operator === 'in' || node.operator === 'not in'
        ? `[${node.value
            .split(',')
            .map((part) => quote(part.trim()))
            .join(', ')}]`
        : /^-?\d+(\.\d+)?$/.test(node.value) ||
            ['true', 'false', 'null'].includes(node.value)
          ? node.value
          : quote(node.value)
    return `${node.attribute} ${node.operator} ${right}`
  }

  return `(${node.children.map((child) => buildTargetQuery(child as TargetNode)).join(` ${node.operator.toLowerCase()} `)})`
}

function parseVariationValue(
  value: unknown,
  type: FeatureFlagValues['valueType'],
) {
  if (type === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
  }
  if (type === 'boolean') return value === true || value === 'true'
  if (type === 'json' && typeof value === 'string') {
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  }
  return value
}


export function createFlagOutput(values: FeatureFlagValues) {
  const variations = Object.fromEntries(
    values.variations.map((variation) => [
      variation.name,
      parseVariationValue(variation.value, values.valueType),
    ]),
  )

  const targeting = values.targeting.map((rule) => {
    const clauses = rule.conditions.children.map((child) =>
      buildTargetQuery(child as TargetNode),
    )

    const query =
      rule.conditions.operator === 'AND'
        ? clauses.join(' and ')
        : clauses.join(' or ')

    const roleQuery = rule.role.trim()
      ? `user.role == ${quote(rule.role.trim())}`
      : ''

    const fullQuery =
      roleQuery && query
        ? `${roleQuery} and (${query})`
        : roleQuery || query

    return {
      query: fullQuery,
      percentage: rule.percentage,
      variation: rule.variation,
    }
  })

  const metadata = Object.fromEntries(
    values.metadata
      .filter((item) => item.key.trim())
      .map((item) => [item.key.trim(), item.value]),
  )

  return {
    flags: {
      [values.flagKey || 'new-feature']: {
        ...(values.description ? { description: values.description } : {}),
        variations,
        targeting,
        defaultRule: { variation: values.defaultVariation },
        disable: !values.enabled,
        trackEvents: values.trackEvents,
        ...(Object.keys(metadata).length ? { metadata } : {}),
      },
    },
  }
}

export function createMultipleFlagsOutput(flags: FeatureFlagValues[]) {
  return {
    flags: Object.assign(
      {},
      ...flags.map((flag) => createFlagOutput(flag).flags),
    ),
  }
}

