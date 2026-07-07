import { logger } from '../../utils/logger';

/**
 * Build prompt for AI to extract and map CSV data to CRM schema
 */
export const buildExtractionPrompt = (
  csvRows: Record<string, any>[],
  headers: string[]
): string => {
  const systemPrompt = buildSystemPrompt();
  const dataPrompt = buildDataPrompt(csvRows, headers);
  const instructionsPrompt = buildInstructionsPrompt();

  return `${systemPrompt}\n\n${dataPrompt}\n\n${instructionsPrompt}`;
};

/**
 * Build system prompt with CRM schema definition
 */
const buildSystemPrompt = (): string => {
  return `You are a data extraction expert for a CRM system. Your task is to intelligently map CSV data to a standardized CRM lead schema.

**Target CRM Schema:**
{
  "created_at": "ISO 8601 date string (default to current date if not found)",
  "name": "string (required)",
  "email": "string (optional, must be valid email)",
  "country_code": "string (optional, phone country code like +1, +91)",
  "mobile_without_country_code": "string (optional, mobile number without country code)",
  "company": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "country": "string (optional)",
  "lead_owner": "string (optional)",
  "crm_status": "string (MUST be one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE - default: GOOD_LEAD_FOLLOW_UP)",
  "crm_note": "string (optional, append multiple emails/phones here, remarks, follow-ups)",
  "data_source": "string (MUST be one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots OR leave blank if none match)",
  "possession_time": "ISO 8601 date string (optional)",
  "description": "string (optional)"
}

**Critical Rules:**
1. NEVER hallucinate or invent data. Only extract what exists in the CSV.
2. SKIP records that have BOTH email AND mobile_without_country_code missing. At least one contact method is required.
3. Normalize phone numbers: extract country code and mobile separately.
4. Normalize dates to ISO 8601 format.
5. Normalize email to lowercase.
6. Map column names intelligently (e.g., "Full Name" → name, "Phone" → mobile).
7. If a field cannot be confidently mapped, leave it empty.
8. Return ONLY valid JSON array. No markdown code blocks (do NOT wrap in \`\`\`json), no explanations, NO THINKING, NO REASONING, NO CHAIN OF THOUGHT. Begin the response immediately with [ and end with ].

**CRM Status Mapping (CRITICAL - use exact values):**
- crm_status MUST be one of these 4 values (case-sensitive):
  * GOOD_LEAD_FOLLOW_UP (for new leads, interested, qualified, hot leads, contacted)
  * DID_NOT_CONNECT (for no answer, busy, unreachable, pending)
  * BAD_LEAD (for not interested, lost, rejected, invalid, junk)
  * SALE_DONE (for sold, won, closed, converted deals)
- If CSV has status field, map it to the closest match above
- If no status field exists, default to: GOOD_LEAD_FOLLOW_UP

**Data Source Mapping (CRITICAL - project names):**
- data_source must be one of these 5 real estate project names OR blank:
  * leads_on_demand
  * meridian_tower
  * eden_park
  * varah_swamy
  * sarjapur_plots
- Look for project/source/campaign columns and map to the closest match
- If no match or generic CSV, leave data_source as empty string ""
- DO NOT use "csv_import" - that is wrong!

**Multiple Contact Handling:**
- If CSV has multiple email columns (email1, email2, etc.), use the first valid email in "email" field
- Append additional emails to "crm_note" like: "Additional emails: email2@example.com, email3@example.com"
- Same for phone numbers: first valid phone → mobile_without_country_code, rest → crm_note
- Example crm_note: "Additional contacts: +91-9876543210 (mobile2), backup@email.com | Remarks: Interested in 2BHK"

**crm_note Consolidation:**
- Append all these to crm_note (separated by " | "):
  * Remarks/Notes/Comments columns
  * Follow-up notes
  * Additional contact info (extra emails/phones)
  * Any other contextual information that doesn't fit standard fields

**Output Format:**
- Return a flat JSON array (no nested objects)
- Each lead must be a single-line JSON object (no line breaks within a record)
- Escape quotes and special characters properly`;
};

/**
 * Build data prompt with CSV rows
 */
const buildDataPrompt = (
  csvRows: Record<string, any>[],
  headers: string[]
): string => {
  return `**CSV Headers:**
${JSON.stringify(headers, null, 2)}

**CSV Data (${csvRows.length} rows):**
${JSON.stringify(csvRows, null, 2)}`;
};

/**
 * Build instructions prompt
 */
const buildInstructionsPrompt = (): string => {
  return `**Instructions:**
1. Analyze the CSV headers and intelligently map them to CRM fields.
2. Extract and transform each row into the CRM schema.
3. Skip rows with BOTH email AND mobile missing (at least one contact method required).
4. Return a JSON array of successfully mapped leads.
5. Use intelligent mapping for common variations:
   - "Full Name", "Name", "Contact Name", "Customer Name" → name
   - "Email", "Email Address", "E-mail", "Email ID" → email
   - "Phone", "Mobile", "Cell", "Contact Number", "Phone Number" → mobile_without_country_code
   - "Company", "Organization", "Business", "Firm" → company
   - "Status", "Lead Status", "Stage" → crm_status (map to: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
   - "Project", "Source", "Campaign", "Property" → data_source (map to: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots, or leave blank)
   - "Remarks", "Notes", "Comments", "Follow-up" → crm_note
   
**Output Format:**
Return ONLY a JSON array of lead objects. Example:
[
  {
    "created_at": "2024-01-15T10:00:00.000Z",
    "name": "John Doe",
    "email": "john@example.com",
    "country_code": "+91",
    "mobile_without_country_code": "9876543210",
    "company": "Acme Corp",
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "lead_owner": "Sales Team",
    "crm_status": "GOOD_LEAD_FOLLOW_UP",
    "crm_note": "Interested in 3BHK | Additional email: john.doe@company.com",
    "data_source": "eden_park",
    "possession_time": "2025-06-01T00:00:00.000Z",
    "description": "Looking for premium apartment"
  },
  {
    "created_at": "2024-01-15T10:00:00.000Z",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "country_code": "+1",
    "mobile_without_country_code": "5551234567",
    "crm_status": "DID_NOT_CONNECT",
    "data_source": ""
  }
]

Begin extraction now. Do NOT output any thinking, reasoning, chain of thought, or markdown wrappers. Output ONLY the JSON array starting with [.`;
};

/**
 * Build batch extraction prompt for large datasets
 */
export const buildBatchExtractionPrompt = (
  batchRows: Record<string, any>[],
  headers: string[],
  batchNumber: number,
  totalBatches: number
): string => {
  logger.info(`Building prompt for batch ${batchNumber}/${totalBatches}`, {
    rows: batchRows.length,
    headers: headers.length,
  });

  return buildExtractionPrompt(batchRows, headers);
};

/**
 * Build validation prompt to check AI output
 */
export const buildValidationPrompt = (aiOutput: string): string => {
  return `Validate the following JSON array of CRM leads. Check for:
1. Valid JSON syntax
2. All required fields present (name, crm_status)
3. Valid email format (if present)
4. Valid crm_status values (GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE)
5. Valid data_source values (leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots, or blank string "")
6. Valid date formats (ISO 8601)
7. At least one contact method (email or mobile_without_country_code) per lead

If valid, return: {"valid": true}
If invalid, return: {"valid": false, "errors": ["error1", "error2"]}

JSON to validate:
${aiOutput}`;
};

/**
 * Build retry prompt with error feedback
 */
export const buildRetryPrompt = (
  originalPrompt: string,
  error: string
): string => {
  return `${originalPrompt}

**Previous Attempt Failed:**
Error: ${error}

Please retry the extraction ensuring:
1. Output is valid JSON
2. No markdown code blocks
3. No explanatory text
4. Just the JSON array`;
};
