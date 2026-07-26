import { format } from 'date-fns'

export const fullDate = (value: unknown) => format(new Date(value as string | Date), 'd MMMM yyyy')

export const shortDate = (value: unknown) => format(new Date(value as string | Date), 'dd/MM/yyyy')

export const monthYear = (value: unknown) => format(new Date(value as string | Date), 'MMMM yyyy')

export const time = (value: unknown) => format(new Date(value as string | Date), 'h:mma').toLowerCase()
