import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ProfileLike = {
  display_name?: unknown
  full_name?: unknown
  first_name?: unknown
  last_name?: unknown
  email?: unknown
}

const asTrimmedString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const resolveUserIdentity = (
  profile: unknown,
  email?: string | null,
  fallbackLabel = 'Your Account'
) => {
  const record = (profile ?? {}) as ProfileLike
  const firstName = asTrimmedString(record.first_name)
  const lastName = asTrimmedString(record.last_name)

  const candidateName = [
    asTrimmedString(record.display_name),
    asTrimmedString(record.full_name),
    [firstName, lastName].filter(Boolean).join(' ').trim(),
    asTrimmedString(record.email),
    asTrimmedString(email),
  ].find((value) => value.length > 0)

  const displayName = candidateName ?? fallbackLabel
  const initialsSource = (candidateName && candidateName.length > 0
    ? candidateName
    : asTrimmedString(email) || fallbackLabel)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const initials = initialsSource.length > 0
    ? initialsSource
    : (fallbackLabel.slice(0, 2).toUpperCase() || 'UA')

  return { displayName, initials }
}
