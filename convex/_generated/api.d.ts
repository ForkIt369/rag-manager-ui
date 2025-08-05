/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_aiProviders from "../actions/aiProviders.js";
import type * as analytics from "../analytics.js";
import type * as chunks from "../chunks.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as lib_aiProviders from "../lib/aiProviders.js";
import type * as queries from "../queries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/aiProviders": typeof actions_aiProviders;
  analytics: typeof analytics;
  chunks: typeof chunks;
  documents: typeof documents;
  files: typeof files;
  "lib/aiProviders": typeof lib_aiProviders;
  queries: typeof queries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
