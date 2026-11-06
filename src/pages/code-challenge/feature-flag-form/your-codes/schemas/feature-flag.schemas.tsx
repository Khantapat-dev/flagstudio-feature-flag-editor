import { z } from 'zod'
import type {
  FeatureFlagValues,
  TargetGroup,
  TargetNode,
} from '../types/feature-flag'

const conditionSchema: z.ZodType<TargetNode, TargetNode> = z.lazy(
  () =>
    z.discriminatedUnion('kind', [
      z.object({
        id: z.string(),
        kind: z.literal('condition'),
        attribute: z.string().min(1, 'Attribute is required'),
        operator: z.enum([
          '==',
          '!=',
          '>',
          '>=',
          '<',
          '<=',
          'in',
          'not in',
          'contains',
        ]),
        value: z.string().min(1, 'Value is required'),
      }),
      z.object({
        id: z.string(),
        kind: z.literal('group'),
        operator: z.enum(['AND', 'OR']),
        children: z
          .array(conditionSchema as z.ZodType<any>)
          .min(1, 'A group needs at least one condition'),
      }),
    ]) as z.ZodType<TargetNode, TargetNode>,
)

const targetGroupSchema: z.ZodType<TargetGroup, TargetGroup> = z.object({
  id: z.string(),
  kind: z.literal('group'),
  operator: z.enum(['AND', 'OR']),
  children: z
    .array(conditionSchema as z.ZodType<any>)
    .min(1, 'A group needs at least one condition'),
})

const baseFeatureFlagSchema = z.object({
  flagKey: z
    .string()
    .trim()
    .min(1, 'Flag name is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use letters, numbers, hyphens, or underscores'),
  description: z
    .string()
    .max(250, 'Description must be 250 characters or fewer'),
  version: z.string().min(1, 'Select a version'),
  enabled: z.boolean(),
  trackEvents: z.boolean(),
  valueType: z.enum(['boolean', 'string', 'number', 'json']),
  variations: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Variation name is required'),
        value: z.union([
          z.boolean(),
          z.string(),
          z.number(),
          z.record(z.string(), z.unknown()),
        ]),
      }),
    )
    .min(1, 'Add at least one variation'),
  defaultVariation: z.string().min(1, 'Select a default variation'),
  targeting: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Rule name is required'),
      role: z.string(),
      conditions: targetGroupSchema,
      percentage: z.number().min(0).max(100),
      variation: z.string().min(1, 'Select a variation'),
    }),
  ),
  metadata: z.array(z.object({ key: z.string(), value: z.string() })),
})

export const featureFlagSchema: z.ZodType<
  FeatureFlagValues,
  FeatureFlagValues
> = baseFeatureFlagSchema.superRefine((values, context) => {
  const variationNames = values.variations.map((item) => item.name.trim())
  if (new Set(variationNames).size !== variationNames.length) {
    context.addIssue({
      code: 'custom',
      path: ['variations'],
      message: 'Variation names must be unique',
    })
  }
  if (!variationNames.includes(values.defaultVariation)) {
    context.addIssue({
      code: 'custom',
      path: ['defaultVariation'],
      message: 'Default variation must exist in the variations list',
    })
  }
  values.targeting.forEach((rule, index) => {
    if (!variationNames.includes(rule.variation)) {
      context.addIssue({
        code: 'custom',
        path: ['targeting', index, 'variation'],
        message: 'Target variation does not exist',
      })
    }
  })
  const metadataKeys = values.metadata
    .map((item) => item.key.trim())
    .filter(Boolean)
  if (new Set(metadataKeys).size !== metadataKeys.length) {
    context.addIssue({
      code: 'custom',
      path: ['metadata'],
      message: 'Metadata keys must be unique',
    })
  }
}) as z.ZodType<FeatureFlagValues, FeatureFlagValues>
