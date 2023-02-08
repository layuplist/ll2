import type { MiddlewareObj } from '@middy/core';
import { v4 as uuid } from 'uuid';

import type { AppSyncResponse } from 'utils/types';
import { AppSyncResolverEvent } from 'aws-lambda';

export class ItemAlreadyExistsError extends Error {
  constructor(key: Record<string, unknown>, tableName: string) {
    super(`Item ${JSON.stringify(key)} already exists in table ${tableName}`);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ItemNotFoundError extends Error {
  constructor(key: Record<string, unknown> | Record<string, unknown>[], tableName: string) {
    super(Array.isArray(key)
      ? `At least one item in ${JSON.stringify(key)} not be found in table ${tableName}`
      : `Item ${JSON.stringify(key)} not found in table ${tableName}`);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class EmptyUpdateError extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (): MiddlewareObj<
  AppSyncResolverEvent<unknown, unknown>,
  AppSyncResponse<unknown>
> => ({
  onError: async (request) => {
    // no action needed if no error
    if (!request.error) return;

    if (Object.values([
      // these errors are passed on to the client
      ItemAlreadyExistsError,
      ItemNotFoundError,
      EmptyUpdateError
    ]).some(err => request.error instanceof err)) {
      request.response = {
        error: {
          message: request.error.message,
          type: request.error.name
        }
      };
    } else {
      // all other errors are caught as 'internal server error'
      const errorId = uuid();
      console.trace(`Uncaught exception in handler, error ID: ${errorId}`, request.error);

      request.response = {
        error: {
          message: `Internal server error (ID: ${errorId})`,
          type: 'InternalServerError'
        }
      };
    }
  }
});
