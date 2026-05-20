import { z } from 'zod';

/**
 * ZEHLA COGNITIVE TOOLS v4.0
 * Strict Zod definitions for the Reasoning Engine.
 */

// --- 1. SKEPTICAL MEMORY CORE ---
export const read_memory_index = z.object({
  query: z.string().describe('Search for short pointers in memory.md index to avoid context entropy')
});

export const load_memory_topic = z.object({
  topicFile: z.string().describe('Load a specific domain knowledge file (e.g., "user_persona.md")')
});

export const grep_transcripts = z.object({
  pattern: z.string().describe('Search raw message logs using regex without loading the entire file')
});

// --- 2. SANDBOXED FILESYSTEM CORE ---
export const safe_read_file = z.object({
  path: z.string().describe('Path to the file for reading'),
  range: z.string().optional().describe('Optional line range, e.g., "1-50"')
});

export const safe_write_file = z.object({
  path: z.string().describe('Path to the file for writing'),
  content: z.string().describe('Content to be written'),
  approvalRequired: z.boolean().default(true).describe('Always requires human approval for critical writes')
});

export const list_directory = z.object({
  path: z.string().describe('Directory path to explore')
});

// --- 3. NETWORK & MARKET INTELLIGENCE CORE ---
export const web_scrape_intelligence = z.object({
  url: z.string().url().describe('Competitor URL to extract pricing and amenities'),
  selectors: z.array(z.string()).optional().describe('CSS selectors for specific data extraction')
});

export const search_market_trends = z.object({
  query: z.string().describe('Search for local hospitality trends or regional pricing')
});

// --- 4. BOOKING & CLOSING CORE ---
export const check_inventory_status = z.object({
  propertyId: z.string(),
  checkIn: z.string().describe('ISO Date'),
  checkOut: z.string().describe('ISO Date')
});

export const calculate_final_quote = z.object({
  roomTypeId: z.string(),
  nights: z.number(),
  guests: z.number(),
  applyPromotions: z.boolean().default(true)
});

// --- 5. SYSTEM & SHELL CORE ---
export const execute_sandboxed_bash = z.object({
  command: z.string().describe('Safe shell command to run in the isolated environment'),
  timeout: z.number().default(5000)
});

export const git_ops = z.object({
  action: z.enum(['status', 'diff', 'commit', 'push']),
  message: z.string().optional()
});

// Export all schemas for the Query Engine
export const ZehlaToolSchemas = {
  read_memory_index,
  load_memory_topic,
  grep_transcripts,
  safe_read_file,
  safe_write_file,
  list_directory,
  web_scrape_intelligence,
  search_market_trends,
  check_inventory_status,
  calculate_final_quote,
  execute_sandboxed_bash,
  git_ops
};
