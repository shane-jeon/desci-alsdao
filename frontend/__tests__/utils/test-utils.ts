import { NextApiRequest, NextApiResponse } from "next";
import { createMocks as originalCreateMocks } from "node-mocks-http";
import { RequestMethod } from "node-mocks-http";

interface CreateMocksOptions {
  method?: RequestMethod;
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

type ExtendedNextApiRequest = NextApiRequest & {
  _setParameter: (key: string, value?: string) => void;
  _addBody: (key: string, value?: unknown) => void;
};

type ExtendedNextApiResponse = NextApiResponse & {
  _getStatusCode: () => number;
  _getData: () => string;
};

// Extend the mock request type to include required NextApiRequest properties
export function createMocks(options: CreateMocksOptions): {
  req: ExtendedNextApiRequest;
  res: ExtendedNextApiResponse;
} {
  const { req, res } = originalCreateMocks({
    method: options.method || "GET",
    body: options.body || {},
    query: options.query || {},
  });

  // Add required NextApiRequest properties
  const request = req as unknown as ExtendedNextApiRequest;
  request.env = {};

  // Add NextApiResponse methods
  const response = res as unknown as ExtendedNextApiResponse;
  response.revalidate = async () => Promise.resolve();
  response.setPreviewData = () => response;
  response.clearPreviewData = () => response;
  response.setDraftMode = () => response;

  return {
    req: request,
    res: response,
  };
}

// Add global fetch type for tests
declare global {
  // eslint-disable-next-line no-var
  var fetch: jest.Mock;
  interface Global {
    fetch: jest.Mock;
  }
}
