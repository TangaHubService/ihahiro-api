import { Location } from '../entities/location.entity'

export interface LocationAncestorDto {
  id: string
  name: string
  type: string
}

export interface LocationResponseDto {
  id: string
  name: string
  type: string
  parentId: string | null
  ancestors?: LocationAncestorDto[]
}

export function toLocationResponse(location: Location, ancestors?: Location[]): LocationResponseDto {
  return {
    id: location.id,
    name: location.name,
    type: location.type,
    parentId: location.parentId,
    ...(ancestors ? { ancestors: ancestors.map((a) => ({ id: a.id, name: a.name, type: a.type })) } : {}),
  }
}
