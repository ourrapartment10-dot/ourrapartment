import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: (error as any).errors },
      { status: 400 }
    );
  }

  // Handle Prisma known request errors (P2002 - Unique constraint)
  if ((error as any).code === 'P2002') {
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    );
  }

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
