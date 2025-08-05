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
import type * as actions_chunkers_semanticChunker from "../actions/chunkers/semanticChunker.js";
import type * as actions_documentProcessor from "../actions/documentProcessor.js";
import type * as actions_lib_fileUtils from "../actions/lib/fileUtils.js";
import type * as actions_lib_monitoring from "../actions/lib/monitoring.js";
import type * as actions_lib_pdfco from "../actions/lib/pdfco.js";
import type * as actions_lib_voyage from "../actions/lib/voyage.js";
import type * as actions_parsers_docxParser from "../actions/parsers/docxParser.js";
import type * as actions_parsers_pdfParser from "../actions/parsers/pdfParser.js";
import type * as actions_parsers_spreadsheetParser from "../actions/parsers/spreadsheetParser.js";
import type * as actions_parsers_textParser from "../actions/parsers/textParser.js";
import type * as actions_uploadFile from "../actions/uploadFile.js";
import type * as actions_vectorSearch from "../actions/vectorSearch.js";
import type * as analytics from "../analytics.js";
import type * as chunks from "../chunks.js";
import type * as diagnostics from "../diagnostics.js";
import type * as documentUpload from "../documentUpload.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as lib_aiProviders from "../lib/aiProviders.js";
import type * as lib_types_processing from "../lib/types/processing.js";
import type * as processingJobs from "../processingJobs.js";
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
  "actions/chunkers/semanticChunker": typeof actions_chunkers_semanticChunker;
  "actions/documentProcessor": typeof actions_documentProcessor;
  "actions/lib/fileUtils": typeof actions_lib_fileUtils;
  "actions/lib/monitoring": typeof actions_lib_monitoring;
  "actions/lib/pdfco": typeof actions_lib_pdfco;
  "actions/lib/voyage": typeof actions_lib_voyage;
  "actions/parsers/docxParser": typeof actions_parsers_docxParser;
  "actions/parsers/pdfParser": typeof actions_parsers_pdfParser;
  "actions/parsers/spreadsheetParser": typeof actions_parsers_spreadsheetParser;
  "actions/parsers/textParser": typeof actions_parsers_textParser;
  "actions/uploadFile": typeof actions_uploadFile;
  "actions/vectorSearch": typeof actions_vectorSearch;
  analytics: typeof analytics;
  chunks: typeof chunks;
  diagnostics: typeof diagnostics;
  documentUpload: typeof documentUpload;
  documents: typeof documents;
  files: typeof files;
  "lib/aiProviders": typeof lib_aiProviders;
  "lib/types/processing": typeof lib_types_processing;
  processingJobs: typeof processingJobs;
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
