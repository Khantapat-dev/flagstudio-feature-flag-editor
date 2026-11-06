import { useForm } from '@tanstack/react-form'
import { featureFlagSchema } from '../schemas/feature-flag.schemas'
import type { FeatureFlagValues } from '../types/feature-flag'

export const initialFeatureFlagValues: FeatureFlagValues = {
  flagKey: 'new-checkout-flow',
  description: 'Enable the redesigned checkout experience.',
  version: 'v1.58.0',
  enabled: true,
  trackEvents: true,
  valueType: 'boolean',
  variations: [
    { name: 'on', value: true },
    { name: 'off', value: false },
  ],
  defaultVariation: 'off',
  targeting: [],
  metadata: [],
}

export function createNewFlagValues(): FeatureFlagValues {
  return {
    ...structuredClone(initialFeatureFlagValues),
    flagKey: '',
    description: '',
    targeting: [],
    metadata: [],
    trackEvents: true,
  }
}

export function useFeatureFlagForm(initialValues: FeatureFlagValues = initialFeatureFlagValues) {
  return useForm({
    defaultValues: initialValues,
    validators: {
      onChange: featureFlagSchema,
    },
    onSubmit: async () => {},
  })
}
