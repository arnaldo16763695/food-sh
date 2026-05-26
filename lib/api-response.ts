import { NextResponse } from "next/server"

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ data }, init)
}

export function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json({ error, details }, { status })
}
