import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Editor from '@monaco-editor/react'
import { Plus, Trash2, Copy, Check, Braces, Tags } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import FlagTabs from './tabs/flag-tabs'
import {
  useFeatureFlagForm,
  createNewFlagValues,
  initialFeatureFlagValues,
} from './hooks/use-feature-flag'
import { featureFlagSchema } from './schemas/feature-flag.schemas'
import FlagHeader from './components/header/header'
import type { FlagVersion } from './components/header/header'
import { createMultipleFlagsOutput } from './utils/flag-json'
import type {
  FeatureFlagValues,
  GroupOperator,
  RuleOperator,
  TargetCondition,
  TargetGroup,
  TargetNode,
  ValueType,
} from './types/feature-flag'
import { Switch } from '#/components/ui/switch'

const fieldClass =
  'h-10 rounded-xl border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'

const panelClass =
  'rounded-2xl border border-border bg-card text-card-foreground shadow-sm'

const uid = () => Math.random().toString(36).slice(2, 10)

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-foreground">
      {children}
      {hint && (
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  )
}

function ErrorText({ errors }: { errors: unknown[] }) {
  if (!errors.length) return null
  const first = errors[0]
  const message =
    typeof first === 'string'
      ? first
      : first && typeof first === 'object' && 'message' in first
        ? String(first.message)
        : String(first)
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function makeCondition(): TargetCondition {
  return {
    id: uid(),
    kind: 'condition',
    attribute: '',
    operator: '==',
    value: '',
  }
}

function makeGroup(): TargetGroup {
  return {
    id: uid(),
    kind: 'group',
    operator: 'AND',
    children: [makeCondition(), makeCondition()],
  }
}

function updateNode(
  nodes: unknown[],
  id: string,
  updater: (node: TargetNode) => TargetNode,
): TargetNode[] {
  return (nodes as TargetNode[]).map((node) => {
    if (node.id === id) return updater(node)
    if (node.kind === 'group')
      return { ...node, children: updateNode(node.children, id, updater) }
    return node
  })
}

function removeNode(nodes: unknown[], id: string): TargetNode[] {
  return (nodes as TargetNode[])
    .filter((node) => node.id !== id)
    .map((node) =>
      node.kind === 'group'
        ? { ...node, children: removeNode(node.children, id) }
        : node,
    )
}

const operatorOptions: {
  value: RuleOperator
  label: string
}[] = [
  { value: '==', label: 'Equals To' },
  { value: '!=', label: 'Not Equals To' },
  { value: '>', label: 'Greater Than' },
  { value: '>=', label: 'Greater Than or Equal' },
  { value: '<', label: 'Less Than' },
  { value: '<=', label: 'Less Than or Equal' },
  { value: 'in', label: 'In' },
  { value: 'not in', label: 'Not In' },
  { value: 'contains', label: 'Contains' },
]

function ConditionTree({
  node,
  onChange,
  onRemove,
  depth = 0,
}: {
  node: TargetNode
  onChange: (node: TargetNode) => void
  onRemove: () => void
  depth?: number
}) {
  if (node.kind === 'condition') {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2">
        <Input
          aria-label="Field"
          className={fieldClass}
          placeholder="Field"
          value={node.attribute}
          onChange={(event) =>
            onChange({
              ...node,
              attribute: event.target.value,
            })
          }
        />

        <Select
          value={node.operator}
          onValueChange={(value) =>
            onChange({
              ...node,
              operator: value as RuleOperator,
            })
          }
        >
          <SelectTrigger className={fieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operatorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          aria-label="Value"
          className={fieldClass}
          placeholder="Value"
          value={node.value}
          onChange={(event) =>
            onChange({
              ...node,
              value: event.target.value,
            })
          }
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove condition"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    )
  }

  const updateChild = (updated: TargetNode) => {
    onChange({
      ...node,
      children: updateNode(node.children, updated.id, () => updated),
    })
  }

  const removeChild = (id: string) => {
    onChange({
      ...node,
      children: removeNode(node.children, id),
    })
  }

  return (
    <div
      className="space-y-4 rounded-xl border border-border bg-muted/20 p-3"
      style={{ marginLeft: depth > 0 ? 12 : 0 }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={node.operator}
          onValueChange={(value) =>
            onChange({
              ...node,
              operator: value as GroupOperator,
            })
          }
        >
          <SelectTrigger className="h-9 w-28 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...node,
              children: [...node.children, makeCondition()],
            })
          }
        >
          <Plus className="mr-1 size-3.5" />
          Rule
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...node,
              children: [...node.children, makeGroup()],
            })
          }
        >
          <Plus className="mr-1 size-3.5" />
          Group
        </Button>

        {depth > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove group"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {(node.children as TargetNode[]).map((child) => (
          <ConditionTree
            key={child.id}
            node={child}
            depth={depth + 1}
            onChange={updateChild}
            onRemove={() => removeChild(child.id)}
          />
        ))}

        {node.children.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Add a rule or group to define conditions.
          </p>
        )}
      </div>
    </div>
  )
}

function GeneralTab({ form }: { form: ReturnType<typeof useFeatureFlagForm> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <form.Field name="flagKey">
          {(field) => (
            <div className="min-w-0">
              <FieldLabel>
                Flag Name <span className="text-destructive">*</span>
              </FieldLabel>

              <Input
                className={fieldClass}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="new-checkout-flow"
              />

              <ErrorText errors={field.state.meta.errors} />
              <p className="mt-1 text-xs text-muted-foreground">
                Unique identifier used by your application.
              </p>
            </div>
          )}
        </form.Field>

        <form.Field name="enabled">
          {(field) => (
            <Switch
              aria-label="Enabled"
              checked={field.state.value}
              onCheckedChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="description">
        {(field) => (
          <div>
            <FieldLabel>
              Description{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Describe what this feature flag controls..."
            />
            <div className="mt-1 flex justify-between gap-3">
              <ErrorText errors={field.state.meta.errors} />
              <span className="ml-auto text-xs text-muted-foreground">
                {field.state.value.length}/250
              </span>
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="trackEvents">
        {(field) => (
          <div className="min-w-0">
            <FieldLabel>Track Events</FieldLabel>

            <div className="flex items-center justify-start align-middle gap-4">
              <Switch
                aria-label="Track Event"
                checked={field.state.value}
                onCheckedChange={field.handleChange}
              />
              <p className="text-xs">Track when this flag is evaluated</p>
            </div>
          </div>
        )}
      </form.Field>
    </div>
  )
}

function VariationsTab({
  form,
}: {
  form: ReturnType<typeof useFeatureFlagForm>
}) {
  return (
    <form.Subscribe
      selector={(state) => ({
        variations: state.values.variations,
        valueType: state.values.valueType,
        defaultVariation: state.values.defaultVariation,
      })}
    >
      {({ variations, valueType, defaultVariation }) => (
        <div className="space-y-6">
          <SectionHeading
            title="Flag variations"
            description="Define the values this flag can return."
            action={
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  form.setFieldValue('variations', [
                    ...variations,
                    {
                      name: `variation_${variations.length + 1}`,
                      value:
                        valueType === 'boolean'
                          ? false
                          : valueType === 'number'
                            ? 0
                            : valueType === 'json'
                              ? '{}'
                              : '',
                    },
                  ])
                }
              >
                <Plus className="mr-2 size-4" /> Add variation
              </Button>
            }
          />
          <div>
            <FieldLabel>Value type</FieldLabel>
            <Select
              value={valueType}
              onValueChange={(value) => {
                const nextType = value as ValueType
                form.setFieldValue('valueType', nextType)
                form.setFieldValue(
                  'variations',
                  variations.map((item) => ({
                    ...item,
                    value:
                      nextType === 'boolean'
                        ? false
                        : nextType === 'number'
                          ? 0
                          : nextType === 'json'
                            ? '{}'
                            : '',
                  })),
                )
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-xl sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-3 bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Variation name</span>
              <span>Value</span>
              <span />
            </div>
            {variations.map((variation, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-center gap-3 border-t border-border px-4 py-3"
              >
                <Input
                  className={fieldClass}
                  value={variation.name}
                  aria-label="Variation name"
                  onChange={(event) => {
                    const nextName = event.target.value
                    form.setFieldValue(
                      'variations',
                      variations.map((item, i) =>
                        i === index ? { ...item, name: nextName } : item,
                      ),
                    )
                    if (defaultVariation === variation.name)
                      form.setFieldValue('defaultVariation', nextName)
                    form.setFieldValue(
                      'targeting',
                      form.state.values.targeting.map((rule) =>
                        rule.variation === variation.name
                          ? { ...rule, variation: nextName }
                          : rule,
                      ),
                    )
                  }}
                />
                {valueType === 'boolean' ? (
                  <Select
                    value={String(variation.value)}
                    onValueChange={(value) =>
                      form.setFieldValue(
                        'variations',
                        variations.map((item, i) =>
                          i === index
                            ? { ...item, value: value === 'true' }
                            : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">true</SelectItem>
                      <SelectItem value="false">false</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className={fieldClass}
                    value={String(variation.value)}
                    aria-label="Variation value"
                    onChange={(event) =>
                      form.setFieldValue(
                        'variations',
                        variations.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                value:
                                  valueType === 'number'
                                    ? Number(event.target.value)
                                    : event.target.value,
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder={
                      valueType === 'json' ? '{"enabled": true}' : 'Value'
                    }
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-muted-foreground hover:text-destructive"
                  disabled={variations.length <= 1}
                  onClick={() => {
                    const next = variations.filter((_, i) => i !== index)
                    form.setFieldValue('variations', next)
                    if (!next.some((item) => item.name === defaultVariation))
                      form.setFieldValue(
                        'defaultVariation',
                        next[0]?.name ?? '',
                      )
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form.Subscribe>
  )
}

function TargetingTab({
  form,
}: {
  form: ReturnType<typeof useFeatureFlagForm>
}) {
  return (
    <form.Subscribe
      selector={(state) => ({
        targeting: state.values.targeting,
        variations: state.values.variations,
      })}
    >
      {({ targeting, variations }) => {
        const addRule = () => {
          form.setFieldValue('targeting', [
            ...targeting,
            {
              id: uid(),
              name: `Rule ${targeting.length + 1}`,
              role: '',
              conditions: makeGroup(),
              percentage: 100,
              variation: variations[0]?.name ?? '',
            },
          ])
        }

        const updateRule = (
          id: string,
          changes: Partial<(typeof targeting)[number]>,
        ) => {
          form.setFieldValue(
            'targeting',
            targeting.map((rule) =>
              rule.id === id ? { ...rule, ...changes } : rule,
            ),
          )
        }

        return (
          <div className="space-y-5">
            <SectionHeading
              title="Target specific users"
              description="Define conditions to determine which variation users receive."
            />

            {targeting.map((rule, index) => (
              <div
                key={rule.id}
                className="relative space-y-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Rule name
                    </label>
                    <Input
                      aria-label={`Rule ${index + 1} name`}
                      className="h-10 max-w-sm border-transparent bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                      value={rule.name}
                      onChange={(event) =>
                        updateRule(rule.id, {
                          name: event.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      form.setFieldValue(
                        'targeting',
                        targeting.filter((item) => item.id !== rule.id),
                      )
                    }
                    aria-label="Remove targeting rule"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <ConditionTree
                  node={rule.conditions}
                  onChange={(conditions) =>
                    updateRule(rule.id, {
                      conditions: conditions as TargetGroup,
                    })
                  }
                  onRemove={() => undefined}
                />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-sm font-medium">Serve</span>

                  <Select
                    value={rule.variation}
                    onValueChange={(value) =>
                      updateRule(rule.id, {
                        variation: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-52 rounded-xl">
                      <SelectValue placeholder="Choose variation" />
                    </SelectTrigger>
                    <SelectContent>
                      {variations
                        .filter((variation) => variation.name.trim())
                        .map((variation, i) => (
                          <SelectItem
                            key={`${variation.name}-${i}`}
                            value={variation.name}
                          >
                            {variation.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-dashed"
              onClick={addRule}
            >
              <Plus className="mr-2 size-4" />
              Add Rule
            </Button>
          </div>
        )
      }}
    </form.Subscribe>
  )
}

function MetadataTab({
  form,
}: {
  form: ReturnType<typeof useFeatureFlagForm>
}) {
  return (
    <form.Subscribe selector={(state) => state.values.metadata}>
      {(metadata) => (
        <div className="space-y-6">
          <SectionHeading
            title="Custom metadata"
            description="Attach additional key-value data to this feature flag."
            action={
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  form.setFieldValue('metadata', [
                    ...metadata,
                    { key: '', value: '' },
                  ])
                }
              >
                <Plus className="mr-2 size-4" /> Add field
              </Button>
            }
          />
          {!metadata.length ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <Tags className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-semibold">No metadata added</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add custom information to help organize this flag.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {metadata.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_40px]"
                >
                  <Input
                    className={fieldClass}
                    placeholder="Key (e.g. owner)"
                    value={item.key}
                    onChange={(event) =>
                      form.setFieldValue(
                        'metadata',
                        metadata.map((entry, i) =>
                          i === index
                            ? { ...entry, key: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Input
                    className={fieldClass}
                    placeholder="Value (e.g. checkout-team)"
                    value={item.value}
                    onChange={(event) =>
                      form.setFieldValue(
                        'metadata',
                        metadata.map((entry, i) =>
                          i === index
                            ? { ...entry, value: event.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      form.setFieldValue(
                        'metadata',
                        metadata.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form.Subscribe>
  )
}

function ValidationSummary({ values }: { values: FeatureFlagValues }) {
  const result = featureFlagSchema.safeParse(values)
  if (result.success) {
    return null
  }

  return (
    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 p-3">
      <p className="mb-2 text-xs font-semibold text-destructive">
        Please review these validation issues:
      </p>
      <ul className="space-y-1 text-xs text-destructive">
        {result.error.issues.slice(0, 6).map((issue, index) => (
          <li key={`${issue.path.join('.')}-${index}`}>
            <span className="font-medium">
              {issue.path.join('.') || 'Configuration'}:
            </span>{' '}
            {issue.message}
          </li>
        ))}
        {result.error.issues.length > 6 && (
          <li>And {result.error.issues.length - 6} more issue(s).</li>
        )}
      </ul>
    </div>
  )
}

function JsonPreview({ flags }: { flags: FlagItem[] }) {
  const [copied, setCopied] = useState(false)
  const allFlags = flags.map((flag) => flag.values)

  const keys = allFlags.map((flag) => flag.flagKey.trim())

  const isValid =
    allFlags.every((flag) => featureFlagSchema.safeParse(flag).success) &&
    keys.every(Boolean) &&
    new Set(keys).size === keys.length
  const json = useMemo(
    () => JSON.stringify(createMultipleFlagsOutput(allFlags), null, 2),
    [flags],
  )
  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside
      className={`${panelClass} flex h-full min-h-[520px] min-w-0 flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <Braces className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">JSON Preview</h2>
            <p className="text-[11px] text-muted-foreground">Live output</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg"
          onClick={copyJson}
          disabled={!isValid}
        >
          {copied ? (
            <Check className="mr-1.5 size-3.5 text-emerald-500" />
          ) : (
            <Copy className="mr-1.5 size-3.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          feature-flag.json
        </span>
        <span
          className={`flex items-center gap-1.5 text-[11px] ${isValid ? 'text-emerald-600' : 'text-destructive'}`}
        >
          <span
            className={`size-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-destructive'}`}
          />
          {isValid ? 'Valid configuration' : 'Needs attention'}
        </span>
      </div>
      <div className="h-[600px] min-h-0 overflow-auto">
        <Editor
          height="600px"
          language="json"
          theme="vs-dark"
          value={json}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            folding: true,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'none',
            overviewRulerBorder: false,
          }}
        />
      </div>
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Output follows the challenge's{' '}
        <code className="rounded bg-muted px-1">flags</code> object format.
      </div>
    </aside>
  )
}

type FlagItem = {
  id: string
  values: FeatureFlagValues
}

function FeatureFlagCard({
  flag,
  index,
  onChange,
  onDelete,
}: {
  flag: FlagItem
  index: number
  onChange: (values: FeatureFlagValues) => void
  onDelete: () => void
}) {
  const form = useFeatureFlagForm(flag.values)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (form.store.state.values.version !== flag.values.version) {
      form.setFieldValue('version', flag.values.version)
    }
  }, [flag.values.version, form])

  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      onChange(structuredClone(form.store.state.values))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [form.store, onChange])

  return (
    <section className={`${panelClass} min-w-0 p-4 sm:p-6`}>
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium text-indigo-500">
            FEATURE FLAG {index + 1}
          </p>
          <form.Subscribe selector={(state) => state.values.flagKey}>
            {(name) => (
              <h2 className="mt-1 truncate text-base font-semibold">
                {name.trim() || 'Untitled flag'}
              </h2>
            )}
          </form.Subscribe>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="mr-1.5 size-4" /> Remove flag
        </Button>
      </div>
      <FlagTabs
        value={activeTab}
        onValueChange={setActiveTab}
        children={{
          general: <GeneralTab form={form} />,
          variations: <VariationsTab form={form} />,
          targeting: <TargetingTab form={form} />,
          metadata: <MetadataTab form={form} />,
        }}
      />
      <form.Subscribe selector={(state) => state.values}>
        {(values) => <ValidationSummary values={values} />}
      </form.Subscribe>
      <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
        Changes are reflected in the JSON preview instantly.
      </p>
    </section>
  )
}

function YourCode() {
  const [flags, setFlags] = useState<FlagItem[]>(() => [
    {
      id: uid(),
      values: structuredClone(initialFeatureFlagValues),
    },
  ])

  const updateFlag = useCallback((id: string, values: FeatureFlagValues) => {
    setFlags((previous) =>
      previous.map((flag) => (flag.id === id ? { ...flag, values } : flag)),
    )
  }, [])

  function addAnotherFlag() {
    setFlags((previous) => {
      const existingNames = new Set(previous.map((flag) => flag.values.flagKey))

      let number = 1

      while (existingNames.has(`new-flag-${number}`)) {
        number++
      }

      return [
        ...previous,
        {
          id: uid(),
          values: {
            ...createNewFlagValues(),
            flagKey: `new-flag-${number}`,
          },
        },
      ]
    })
  }

  function deleteFlag(id: string) {
    setFlags((previous) =>
      previous.length > 1
        ? previous.filter((flag) => flag.id !== id)
        : [{ id: uid(), values: createNewFlagValues() }],
    )
  }

  function resetForm() {
    setFlags([{ id: uid(), values: structuredClone(initialFeatureFlagValues) }])
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] space-y-6 bg-background text-foreground">
      <FlagHeader
        version={flags[0].values.version as FlagVersion}
        onVersionChange={(version) => {
          setFlags((previous) =>
            previous.map((flag) => ({
              ...flag,
              values: { ...flag.values, version },
            })),
          )
        }}
        onReset={resetForm}
        onAddFlag={addAnotherFlag}
      />
      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {flags.map((flag, index) => (
            <FeatureFlagCard
              key={flag.id}
              flag={flag}
              index={index}
              onChange={(values) => updateFlag(flag.id, values)}
              onDelete={() => deleteFlag(flag.id)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addAnotherFlag}
            className="h-12 w-full gap-2 rounded-xl border-dashed border-indigo-500/40 text-indigo-500 hover:border-indigo-500 hover:bg-indigo-500/5"
          >
            <Plus className="size-4" /> Add Another Flag
          </Button>
        </div>
        <div className="min-w-0 xl:sticky xl:top-5">
          <JsonPreview flags={flags} />
        </div>
      </div>
    </main>
  )
}

export default YourCode
