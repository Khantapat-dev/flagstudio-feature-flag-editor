import { createFileRoute } from '@tanstack/react-router'
import FeatureFlagForm from '#/pages/code-challenge/feature-flag-form'

export const Route = createFileRoute('/')({ component: FeatureFlagForm })
