import ollama from "ollama";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables from .env file
dotenv.config();

// Check for required environment variables
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL not found in environment or .env file");
  console.error("Please create a .env file with the following format:");
  console.error("DATABASE_URL=postgres://user:password@localhost:5432/dbname");
  process.exit(1);
}

const SYSTEM_PROMPT = `
You have access to a PostgreSQL database.
Use your knowledge of SQL to answer the user's question by writing queries on their behalf.
You may only respond with a single query at a time.

Your response must be in this format:

\`\`\`sql
Your query goes here.
\`\`\`

If the user tells you that there was an MCP error, analyze the error and respond with a different query.

When you think you have the final answer to the user's question, prefix your response with "Final Answer:\n"
`;

const USER_PROMPT = `
I have a database with the following tables:

[
  {"table_name": "action_item_status_history"},
  {"table_name": "application_key"},
  {"table_name": "board"},
  {"table_name": "alembic_version"},
  {"table_name": "archival_measurement"},
  {"table_name": "application_audit"},
  {"table_name": "combined_load"},
  {"table_name": "customer_operating_preferences_staging"},
  {"table_name": "application"},
  {"table_name": "bank_account"},
  {"table_name": "baseline_value"},
  {"table_name": "control_profile"},
  {"table_name": "archival_facility_measurement"},
  {"table_name": "account_manager"},
  {"table_name": "action_item"},
  {"table_name": "board_access_control"},
  {"table_name": "email_facility"},
  {"table_name": "email"},
  {"table_name": "device"},
  {"table_name": "dwolla_customer"},
  {"table_name": "facility_contact_association"},
  {"table_name": "facility_operating_preferences"},
  {"table_name": "facility_operating_preferences_account_default"},
  {"table_name": "facility_operating_preferences_account_default_staging"},
  {"table_name": "facility"},
  {"table_name": "facility_enablement"},
  {"table_name": "facility_operating_preferences_staging"},
  {"table_name": "program"},
  {"table_name": "hubspot_email_user"},
  {"table_name": "meter"},
  {"table_name": "firmware_update"},
  {"table_name": "foobar"},
  {"table_name": "identity_role"},
  {"table_name": "facility_transfers"},
  {"table_name": "organization"},
  {"table_name": "feature_access"},
  {"table_name": "generator"},
  {"table_name": "hubspot_email"},
  {"table_name": "program_facility_association"},
  {"table_name": "historical_program_facility_association"},
  {"table_name": "interval_staging"},
  {"table_name": "line_item_event_association"},
  {"table_name": "line_item"},
  {"table_name": "market_timezone_override"},
  {"table_name": "meter_configuration"},
  {"table_name": "miso_lmr_price_offer_selection"},
  {"table_name": "portfolio"},
  {"table_name": "opportunity"},
  {"table_name": "portfolio_facilities"},
  {"table_name": "portfolio_type"},
  {"table_name": "program_geography_association_temp"},
  {"table_name": "program_tmp_migration"},
  {"table_name": "request_job"},
  {"table_name": "meter_provider_configuration"},
  {"table_name": "meter_provider"},
  {"table_name": "payment_program_association"},
  {"table_name": "portfolio_applications"},
  {"table_name": "portfolio_metadata"},
  {"table_name": "program_zipcode_association"},
  {"table_name": "registration_dispatch_performance"},
  {"table_name": "registration_potential_value"},
  {"table_name": "permission"},
  {"table_name": "role_permissions"},
  {"table_name": "portfolio_users"},
  {"table_name": "settlement_payment"},
  {"table_name": "ses_email_user"},
  {"table_name": "settlement_payment_transition_reason"},
  {"table_name": "ses_email"},
  {"table_name": "user_alert_configuration"},
  {"table_name": "user_alert_notification"},
  {"table_name": "temp_portfolio"},
  {"table_name": "scheduled_event"},
  {"table_name": "settlement_baseline_value"},
  {"table_name": "user_audit_impl"},
  {"table_name": "user"},
  {"table_name": "settlement_facility_load"},
  {"table_name": "user_activation_audit"},
  {"table_name": "user_query"},
  {"table_name": "voltus_opportunity_product"},
  {"table_name": "vcrm_group_registration"},
  {"table_name": "vendor_payment"},
  {"table_name": "voltlet_configuration"},
  {"table_name": "event_facility_association"},
  {"table_name": "event_acknowledgment"},
  {"table_name": "action_item_attempt"},
  {"table_name": "utility_account"},
  {"table_name": "role"},
  {"table_name": "line_item_transition_log"},
  {"table_name": "openadr_settings"},
  {"table_name": "settlement_payment_transition_log"},
  {"table_name": "salesorders"},
  {"table_name": "salesorders_read"},
  {"table_name": "customer_order"}

]

I have a question:

`;

class OllamaMCPHost {
  private client: Client;
  private transport: StdioClientTransport;
  private modelName: string;
  private chatHistory: { role: string; content: string }[] = [];
  private readonly MAX_HISTORY_LENGTH = 20;
  private readonly MAX_RETRIES = 5;
  private isConnected: boolean = false;

  constructor(modelName?: string) {
    this.modelName =
      modelName || process.env.OLLAMA_MODEL || "codegemma:latest";
    this.transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", databaseUrl!],
      // args: ["-y", "@henkey/postgres-mcp-server", databaseUrl!],

    });
    this.client = new Client(
      { name: "ollama-mcp-host", version: "1.0.0" },
      { capabilities: {} }
    );
  }

  async connect() {
    if (!this.isConnected) {
      console.log("Connecting to the database...");
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log("Connected to the database.");
    }
  }

  private async executeQuery(sql: string): Promise<string> {
    console.log(`Executing SQL query: ${sql}`);
    const response = await this.client.request(
      {
        method: "tools/call",
        params: {
          name: "query",
          arguments: { sql },
        },
      },
      CallToolResultSchema
    );

    if (!response.content?.[0]?.text) {
      throw new Error("No text content received from query");
    }
    console.log(`Query result: ${response.content[0].text}`);
    return response.content[0].text as string;
  }

  private addToHistory(role: string, content: string) {
    // console.log(`Adding to history - Role: ${role}, Content: ${content}`);
    this.chatHistory.push({ role, content });
    while (this.chatHistory.length > this.MAX_HISTORY_LENGTH) {
      this.chatHistory.shift();
    }
    // console.log("Updated chat history:", this.chatHistory);
  }

  async processQuestion(question: string): Promise<string> {
    try {
      // Reconnect to the database for every new chat request
      await this.connect();

      let attemptCount = 0;

      while (attemptCount <= this.MAX_RETRIES) {
        const messages = [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${USER_PROMPT}${question}`,
          },
          ...this.chatHistory,
        ];

        console.log(
          attemptCount > 0 ? `\nRetry attempt ${attemptCount}...` : ""
        );

        // Get response from Ollama
        console.log("Sending request to Ollama...");
        const response = await ollama.chat({
          model: this.modelName,
          messages: messages,
        });
        console.log("Received response from Ollama:", response);

        // Extract SQL query
        const sqlMatch = response.message.content.match(
          /```sql\n([\s\S]*?)\n```/
        );
        if (!sqlMatch) {
          this.addToHistory("assistant", response.message.content);
          return response.message.content;
        }

        const sql = sqlMatch[1].trim();

        try {
          // Execute the query
          const queryResult = await this.executeQuery(sql);
          this.addToHistory("assistant", response.message.content);
          this.addToHistory(
            "user",
            `Here are the results of the SQL query: ${queryResult}`
          );
          return queryResult;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.addToHistory("user", errorMessage);
          console.error("Error executing query:", errorMessage);
          if (attemptCount === this.MAX_RETRIES) {
            return `I apologize, but I was unable to successfully query the database after ${
              this.MAX_RETRIES + 1
            } attempts. The last error was: ${errorMessage}`;
          }
        }

        attemptCount++;
      }

      return "An unexpected error occurred while processing your question.";
    } catch (error) {
      console.error("Error processing question:", error);
      return `An error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  async cleanup() {
    console.log("Closing transport...");
    await this.transport.close();
    this.isConnected = false;
    console.log("Transport closed.");
  }
}

async function main() {
  const host = new OllamaMCPHost();
  const readline = (await import("readline")).default.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    await host.connect();
    console.log(
      "\nConnected to database. You can now ask questions about your data."
    );
    console.log('Type "/exit" to quit.\n');

    const askQuestion = (prompt: string) =>
      new Promise<string>((resolve) => {
        readline.question(prompt, resolve);
      });

    while (true) {
      const userInput = await askQuestion(
        "\nWhat would you like to know about your data? "
      );

      if (userInput.toLowerCase().includes("/exit")) {
        console.log("\nGoodbye!\n");
        readline.close();
        await host.cleanup();
        process.exit(0);
      }

      console.log("\nAnalyzing...\n");
      const answer = await host.processQuestion(userInput);
      console.log("\n", answer, "\n");
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    readline.close();
    await host.cleanup();
    process.exit(1);
  }
}

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export default OllamaMCPHost;