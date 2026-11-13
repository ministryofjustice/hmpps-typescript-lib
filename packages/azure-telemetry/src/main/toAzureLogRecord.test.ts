import type { Resource } from '@opentelemetry/resources'
import type { ReadableLogRecord } from '@opentelemetry/sdk-logs'
import { toAzureAttributeValue, toAzureLogBody, toAzureLogRecord, toAzureResource } from './toAzureLogRecord'

const resourceWith = (attributes: Record<string, unknown>, overrides: Partial<Resource> = {}): Resource => ({
  attributes,
  merge: jest.fn(),
  getRawAttributes: () => [],
  ...overrides,
})

describe('toAzureLogBody()', () => {
  it.each([undefined, null, 'message', 42, true, { key: 'value' }, ['a', 1], new Uint8Array([1])])(
    'passes %p through unchanged',
    body => {
      expect(toAzureLogBody(body)).toBe(body)
    },
  )

  it.each([
    [BigInt(10), '10'],
    [Symbol('s'), 'Symbol(s)'],
  ])('stringifies %p', (body, expected) => {
    expect(toAzureLogBody(body)).toBe(expected)
  })
})

describe('toAzureAttributeValue()', () => {
  it.each([undefined, 'value', 1, false, [], ['a', null, 'b'], [1, undefined, 2], [true, false]])(
    'passes %p through unchanged',
    value => {
      expect(toAzureAttributeValue(value)).toBe(value)
    },
  )

  it.each([
    [{ key: 'value' }, '{"key":"value"}'],
    [['a', 1], '["a",1]'],
    [[{ a: 1 }], '[{"a":1}]'],
    [null, 'null'],
    [BigInt(10), '10'],
  ])('stringifies %p', (value, expected) => {
    expect(toAzureAttributeValue(value)).toBe(expected)
  })

  it('falls back to String() for unserialisable objects', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(toAzureAttributeValue(circular)).toBe('[object Object]')
  })
})

describe('toAzureResource()', () => {
  it('converts attributes and caches the result', () => {
    const resource = resourceWith({ 'service.name': 'test', nested: { a: 1 } })

    const azureResource = toAzureResource(resource)

    expect(azureResource.attributes).toEqual({ 'service.name': 'test', nested: '{"a":1}' })
    expect(azureResource.getRawAttributes()).toEqual([
      ['service.name', 'test'],
      ['nested', '{"a":1}'],
    ])
    expect(toAzureResource(resource)).toBe(azureResource)
  })

  it('reconverts while async attributes are pending', () => {
    const waitForAsyncAttributes = jest.fn().mockResolvedValue(undefined)
    const resource = resourceWith({}, { asyncAttributesPending: true, waitForAsyncAttributes })

    const azureResource = toAzureResource(resource)

    expect(toAzureResource(resource)).not.toBe(azureResource)
    expect(azureResource.asyncAttributesPending).toBe(true)
    azureResource.waitForAsyncAttributes!()
    expect(waitForAsyncAttributes).toHaveBeenCalled()
  })

  it('delegates merge to the original resource', () => {
    const merged = resourceWith({ merged: true })
    const resource = resourceWith({}, { merge: jest.fn().mockReturnValue(merged) })
    const other = toAzureResource(resourceWith({ other: true }))

    expect(toAzureResource(resource).merge(other).attributes).toEqual({ merged: true })
    expect(resource.merge).toHaveBeenCalledWith(other)
  })
})

describe('toAzureLogRecord()', () => {
  it('copies getter-backed fields from the log record', () => {
    const resource = resourceWith({ 'service.name': 'test' })
    const fields = {
      hrTime: [1, 2],
      hrTimeObserved: [3, 4],
      spanContext: { traceId: 't', spanId: 's', traceFlags: 1 },
      severityText: 'INFO',
      severityNumber: 9,
      body: 'hello',
      resource,
      instrumentationScope: { name: 'scope' },
      attributes: { key: 'value', big: BigInt(1) },
      droppedAttributesCount: 0,
    }
    const record = Object.create(
      {},
      Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, { get: () => value }])),
    ) as ReadableLogRecord

    expect(toAzureLogRecord(record)).toEqual({
      ...fields,
      resource: toAzureResource(resource),
      attributes: { key: 'value', big: '1' },
    })
  })
})
