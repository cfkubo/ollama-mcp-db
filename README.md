# Ollama MCP Database Assistant

An interactive chat interface that combines Ollama's LLM capabilities with PostgreSQL database access through the Model Context Protocol (MCP). Ask questions about your data in natural language and get AI-powered responses backed by real SQL queries.

## Features

- Natural language interface to your PostgreSQL database
- Automatic SQL query generation
- Schema-aware responses
- Interactive chat interface
- Secure, read-only database access

## Prerequisites

- Node.js 16 or higher
- A running PostgreSQL database
- [Ollama](https://ollama.ai) installed and running locally
- The qwen2.5-coder:7b-instruct model pulled in Ollama

## Setup

1. Clone the repository:

```bash
git clone [your-repo-url]
cd [your-repo-name]
```

2. Install dependencies:

```bash
npm install
```

3. Pull the required Ollama model: # works with codegemma

```bash
ollama pull qwen2.5-coder:7b-instruct
```

4. Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OLLAMA_MODEL=qwen2.5-coder:7b-instruct  # Optional - this is the default
```

## Usage

1. Start the chat interface:

```bash
npm start
```

2. Ask questions about your data in natural language:

```
Connected to database. You can now ask questions about your data.
Type "exit" to quit.

What would you like to know about your data? Which products generated the most revenue last month?
Analyzing...

[AI will generate and execute a SQL query, then explain the results]
```

3. Type 'exit' to quit the application.

## How It Works

1. The application connects to your PostgreSQL database through the [PostgreSQL MCP server](https://www.npmjs.com/package/@modelcontextprotocol/server-postgres)
2. It loads and caches your database schema
3. When you ask a question:
   - The schema and question are sent to Ollama
   - Ollama generates an appropriate SQL query
   - The query is executed through MCP
   - Results are sent back to Ollama for interpretation
   - You receive a natural language response

## Environment Variables

| Variable     | Description                  | Default                   |
| ------------ | ---------------------------- | ------------------------- |
| DATABASE_URL | PostgreSQL connection string | Required                  |
| OLLAMA_MODEL | Ollama model to use          | qwen2.5-coder:7b-instruct |

## Security

- All database access is read-only
- SQL queries are restricted to SELECT statements
- Database credentials are kept secure in your .env file

## Development

Built with:

- TypeScript
- Model Context Protocol (MCP)
- Ollama
- PostgreSQL

## Troubleshooting

### Common Issues

1. "Failed to connect to database"

   - Check your DATABASE_URL in .env
   - Verify PostgreSQL is running
   - Check network connectivity

2. "Failed to connect to Ollama"

   - Ensure Ollama is running (`ollama serve`)
   - Verify the model is installed (`ollama list`)

3. "Error executing query"
   - Check database permissions
   - Verify table/column names in the schema

### Sample:
```
What would you like to know about your data? what table are available in public schema

Analyzing...


Sending request to Ollama...
Received response from Ollama: {
  model: 'qwen2.5-coder:7b-instruct',
  created_at: '2025-03-15T14:52:28.09336Z',
  message: {
    role: 'assistant',
    content: '```sql\n' +
      'SELECT table_name \n' +
      'FROM information_schema.tables \n' +
      "WHERE table_schema = 'public';\n" +
      '```'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 16346180667,
  load_duration: 846204250,
  prompt_eval_count: 1066,
  prompt_eval_duration: 14760000000,
  eval_count: 21,
  eval_duration: 580000000
}
Query result: [
  {
    "table_name": "customer_order"
  },
  {
    "table_name": "salesorders_json"
  },
  {
    "table_name": "salesorders"
  },
  {
    "table_name": "salesorders_read"
  },
  {
    "table_name": "vectorized_data"
  }
]

Retry attempt 1...
Sending request to Ollama...
Received response from Ollama: {
  model: 'qwen2.5-coder:7b-instruct',
  created_at: '2025-03-15T14:52:30.567163Z',
  message: {
    role: 'assistant',
    content: 'Based on the provided query results, the tables available in the public schema are:\n' +
      '\n' +
      '1. `customer_order`\n' +
      '2. `salesorders_json`\n' +
      '3. `salesorders`\n' +
      '4. `salesorders_read`\n' +
      '5. `vectorized_data`\n' +
      '\n' +
      'Final Answer:\n' +
      'The tables available in the public schema are: customer_order, salesorders_json, salesorders, salesorders_read, vectorized_data'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 2358331917,
  load_duration: 32070292,
  prompt_eval_count: 1175,
  prompt_eval_duration: 218000000,
  eval_count: 79,
  eval_duration: 2096000000
}

 Based on the provided query results, the tables available in the public schema are:

1. `customer_order`
2. `salesorders_json`
3. `salesorders`
4. `salesorders_read`
5. `vectorized_data`

Final Answer:
The tables available in the public schema are: customer_order, salesorders_json, salesorders, salesorders_read, vectorized_data
```

### Sample Output 
```

What would you like to know about your data? can you execute this query this "select version();" and provide me with the output please

Analyzing...


Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:21:21.990644Z',
  message: { role: 'assistant', content: '```sql\nSELECT version();\n```' },
  done_reason: 'stop',
  done: true,
  total_duration: 16692451166,
  load_duration: 45025583,
  prompt_eval_count: 1377,
  prompt_eval_duration: 16441000000,
  eval_count: 9,
  eval_duration: 193000000
}
Query result: [
  {
    "version": "PostgreSQL 17.4 (Debian 17.4-1.pgdg120+2) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit"
  }
]

Retry attempt 1...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:21:24.017671Z',
  message: {
    role: 'assistant',
    content: 'Final Answer:\n' +
      "The user's query is `select version();`. The output of the query is:\n" +
      '\n' +
      '```\n' +
      'version()\n' +
      '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------'
  },
  done: false
}

 Final Answer:
The user's query is `select version();`. The output of the query is:


version()
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


% npm start

> ollama-mcp-db@1.0.0 start
> tsx src/index.ts


Connected to database. You can now ask questions about your data.
Type "/exit" to quit.


What would you like to know about your data?  provide me with psql query to pull top 10 rows from salesorders table;

Analyzing...


Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:21:58.224457Z',
  message: {
    role: 'assistant',
    content: '```sql\nSELECT * FROM salesorders LIMIT 10;\n```'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 11296045042,
  load_duration: 43122583,
  prompt_eval_count: 1377,
  prompt_eval_duration: 10882000000,
  eval_count: 16,
  eval_duration: 366000000
}
Query result: [
  {
    "order_id": 1193,
    "payload": "{product='Laptop', price=57.21, quantity=7, shipTo='Address 16', paymentMethod='check', orderDate=2025-02-18, address='140 Elm St, Othertown, USA, 98994', storeName='Quick Mart', storeAddress='754 Pine Ln, Anytown, USA, 75456', salesRepName='David Johnson'}"
  },
  {
    "order_id": 1194,
    "payload": "{product='Jacket', price=680.12, quantity=10, shipTo='Address 66', paymentMethod='cash', orderDate=2025-02-21, address='817 Sunset Blvd, Chicago, USA, 64760', storeName='Local Bazaar', storeAddress='800 Pine Ln, Sometown, USA, 66769', salesRepName='Bob Brown'}"
  },
  {
    "order_id": 1195,
    "payload": "{product='Jeans', price=410.45, quantity=4, shipTo='Address 52', paymentMethod='apple pay', orderDate=2025-02-25, address='250 Broadway, Chicago, USA, 63572', storeName='Local Bazaar', storeAddress='653 Pine Ln, Chicago, USA, 10981', salesRepName='Grace Miller'}"
  },
  {
    "order_id": 1196,
    "payload": "{product='diamonds', price=673.72, quantity=1, shipTo='Address 92', paymentMethod='paypal', orderDate=2025-03-04, address='124 Elm St, Sometown, USA, 87195', storeName='Local Store', storeAddress='944 Pine Ln, Los Angeles, USA, 51737', salesRepName='John Brown'}"
  },
  {
    "order_id": 1197,
    "payload": "{product='Running Shoes', price=810.15, quantity=1, shipTo='Address 48', paymentMethod='debit', orderDate=2025-03-02, address='697 Elm St, Vegas, USA, 55316', storeName='Local Shop', storeAddress='204 River Rd, Othertown, USA, 19280', salesRepName='Bob Doe'}"
  },
  {
    "order_id": 1198,
    "payload": "{product='silver ring', price=12.85, quantity=4, shipTo='Address 12', paymentMethod='google pay', orderDate=2025-02-19, address='556 Chase Street, Othertown, USA, 17824', storeName='Mega Mart', storeAddress='851 Park Ave, Anytown, USA, 60131', salesRepName='Eve Davis'}"
  },
  {
    "order_id": 1199,
    "payload": "{product='Running Shoes', price=250.11, quantity=1, shipTo='Address 45', paymentMethod='check', orderDate=2025-02-20, address='200 Sunset Blvd, Sometown, USA, 28412', storeName='Local Mart', storeAddress='34 Park Ave, Vegas, USA, 37897', salesRepName='Grace Doe'}"
  },
  {
    "order_id": 1200,
    "payload": "{product='Laptop', price=235.64, quantity=1, shipTo='Address 60', paymentMethod='debit', orderDate=2025-02-18, address='456 Oak St, Vegas, USA, 59947', storeName='Super Emporium', storeAddress='843 Pine Ln, Los Angeles, USA, 45984', salesRepName='David Doe'}"
  },
  {
    "order_id": 1201,
    "payload": "{product='Gloves', price=467.8, quantity=10, shipTo='Address 82', paymentMethod='apple pay', orderDate=2025-02-22, address='290 Oak St, Vegas, USA, 14762', storeName='Super Store', storeAddress='693 Market St, Vegas, USA, 69609', salesRepName='Henry Taylor'}"
  },
  {
    "order_id": 1202,
    "payload": "{product='Gold Ring', price=176.77, quantity=6, shipTo='Address 69', paymentMethod='credit', orderDate=2025-03-05, address='917 Sunset Blvd, Vegas, USA, 54543', storeName='Mega Emporium', storeAddress='220 Pine Ln, Anytown, USA, 38337', salesRepName='Charlie Johnson'}"
  }
]

Retry attempt 1...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:22:01.706536Z',
  message: {
    role: 'assistant',
    content: '**Final Answer:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE product = 'Laptop';\n" +
      '```'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 3278032584,
  load_duration: 44365375,
  prompt_eval_count: 1422,
  prompt_eval_duration: 2666000000,
  eval_count: 22,
  eval_duration: 505000000
}

Retry attempt 2...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:22:04.985375Z',
  message: {
    role: 'assistant',
    content: '**Corrected Query:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE payload::jsonb->>'product' = 'Laptop';\n" +
      '```\n' +
      '\n' +
      '**Explanation:**\n' +
      '\n' +
      'The MCP error indicates that the column "product" does not exist in the salesorders table. However, the payload column contains JSON data, and we need to extract the product value from the JSON payload.\n' +
      '\n' +
      'The corrected query uses the `->>` operator to access the "product" key in the JSON payload and compare it to the value \'Laptop\'. The `::jsonb` cast converts the payload column to a JSON object.'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 3254977833,
  load_duration: 18697083,
  prompt_eval_count: 1483,
  prompt_eval_duration: 170000000,
  eval_count: 121,
  eval_duration: 3025000000
}

Retry attempt 3...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:22:08.868058Z',
  message: {
    role: 'assistant',
    content: '**Corrected Query:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE payload::json->>'product' = 'Laptop';\n" +
      '```\n' +
      '\n' +
      '**Explanation:**\n' +
      '\n' +
      'The previous query used the `->>` operator, which expects a JSON object. However, the payload column contains JSON data with an array structure.\n' +
      '\n' +
      'The corrected query uses the `->` operator, which handles JSON arrays. It extracts the product value from the first element of the array.\n' +
      '\n' +
      '**Note:**\n' +
      '\n' +
      '* The `::json` cast converts the payload column to a JSON object.\n' +
      '* The `->` operator extracts the value from the first element of the JSON array.'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 3869302666,
  load_duration: 17346708,
  prompt_eval_count: 1642,
  prompt_eval_duration: 153000000,
  eval_count: 131,
  eval_duration: 3688000000
}

Retry attempt 4...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:22:12.261053Z',
  message: {
    role: 'assistant',
    content: '**Corrected Query:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE payload::jsonb->0->>'product' = 'Laptop';\n" +
      '```\n' +
      '\n' +
      '**Explanation:**\n' +
      '\n' +
      'The previous query used the `->` operator, which did not account for the nested structure of the JSON array.\n' +
      '\n' +
      'The corrected query uses the `->0->` operator to access the first element of the first array in the JSON payload.\n' +
      '\n' +
      '**Final Answer:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE payload::jsonb->0->>'product' = 'Laptop';\n" +
      '```'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 3387017375,
  load_duration: 18391166,
  prompt_eval_count: 1811,
  prompt_eval_duration: 160000000,
  eval_count: 116,
  eval_duration: 3194000000
}

Retry attempt 5...
Sending request to Ollama...
Received response from Ollama: {
  model: 'codegemma:latest',
  created_at: '2025-03-15T15:22:14.39324Z',
  message: {
    role: 'assistant',
    content: '**Corrected Query:**\n' +
      '\n' +
      '```sql\n' +
      "SELECT * FROM salesorders WHERE payload::jsonb->>'product' = 'Laptop';\n" +
      '```\n' +
      '\n' +
      '**Explanation:**\n' +
      '\n' +
      'The final query uses the correct JSON syntax and operator to extract the product value from the JSON payload. It correctly identifies the column "product" as an existing column in the salesorders table.'
  },
  done_reason: 'stop',
  done: true,
  total_duration: 2120525959,
  load_duration: 30763792,
  prompt_eval_count: 1965,
  prompt_eval_duration: 154000000,
  eval_count: 72,
  eval_duration: 1923000000
}

 I apologize, but I was unable to successfully query the database after 6 attempts. The last error was: MCP error -32603: invalid input syntax for type json

```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
