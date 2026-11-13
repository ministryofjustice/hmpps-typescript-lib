import type { AzureMonitorLogExporter } from '@azure/monitor-opentelemetry-exporter'
import type { Attributes } from '@opentelemetry/api'
import type { Resource } from '@opentelemetry/resources'
import type { ReadableLogRecord } from '@opentelemetry/sdk-logs'

/*
 * The Azure exporter bundles its own OpenTelemetry v2 packages, whose types are stricter than v3's
 * (v3 types log bodies and attribute values as `unknown`). These adapters convert v3 log records into
 * the shape the exporter expects, passing through values that are already compatible.
 */
export type AzureLogRecord = Parameters<AzureMonitorLogExporter['export']>[0][number]
type AzureLogBody = AzureLogRecord['body']
type AzureLogAttributes = AzureLogRecord['attributes']
type AzureResource = AzureLogRecord['resource']
type AzureResourceAttributes = AzureResource['attributes']
type AzureAttributeValue = AzureResourceAttributes[string]

const isPrimitive = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

function stringify(value: unknown): string {
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      // fall through for unserialisable values, e.g. circular references
    }
  }
  return String(value)
}

/** Primitives and objects are passed through unchanged; values with no `AnyValue` equivalent are stringified. */
export function toAzureLogBody(body: unknown): AzureLogBody {
  if (body === undefined || isPrimitive(body)) return body
  if (typeof body === 'object') return body as AzureLogBody
  return String(body)
}

function toAzureLogAttributes(attributes: Attributes): AzureLogAttributes {
  return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, toAzureLogBody(value)]))
}

/** Resource attributes only allow primitives or homogeneous primitive arrays; anything else is stringified. */
export function toAzureAttributeValue(value: unknown): AzureAttributeValue {
  if (value === undefined || isPrimitive(value)) return value
  if (Array.isArray(value)) {
    const types = new Set(value.filter(item => item !== null && item !== undefined).map(item => typeof item))
    const [type] = types
    if (types.size === 0 || (types.size === 1 && (type === 'string' || type === 'number' || type === 'boolean'))) {
      return value as AzureAttributeValue
    }
  }
  return stringify(value)
}

function toAzureResourceAttributes(attributes: Attributes): AzureResourceAttributes {
  return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, toAzureAttributeValue(value)]))
}

const azureResources = new WeakMap<Resource, AzureResource>()

export function toAzureResource(resource: Resource): AzureResource {
  const cached = azureResources.get(resource)
  if (cached && !resource.asyncAttributesPending) return cached

  const attributes = toAzureResourceAttributes(resource.attributes)
  const azureResource: AzureResource = {
    asyncAttributesPending: resource.asyncAttributesPending,
    attributes,
    waitForAsyncAttributes: resource.waitForAsyncAttributes?.bind(resource),
    merge: other => toAzureResource(resource.merge(other)),
    getRawAttributes: () => Object.entries(attributes),
  }
  azureResources.set(resource, azureResource)
  return azureResource
}

/** Copies fields explicitly as v3 log records expose them via getters, which object spread would drop. */
export function toAzureLogRecord(record: ReadableLogRecord): AzureLogRecord {
  return {
    hrTime: record.hrTime,
    hrTimeObserved: record.hrTimeObserved,
    spanContext: record.spanContext,
    severityText: record.severityText,
    severityNumber: record.severityNumber,
    body: toAzureLogBody(record.body),
    resource: toAzureResource(record.resource),
    instrumentationScope: record.instrumentationScope,
    attributes: toAzureLogAttributes(record.attributes),
    droppedAttributesCount: record.droppedAttributesCount,
  }
}
