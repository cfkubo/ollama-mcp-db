# Ollama MCP Host

This script integrates Ollama with a PostgreSQL database using the Model Context Protocol (MCP) to enable natural language querying of the database. It allows users to ask questions in plain English, which are then translated into SQL queries, executed against the database, and the results are returned.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Script Details](#script-details)
- [Error Handling](#error-handling)
- [Cleanup](#cleanup)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before running this script, ensure you have the following installed:

-   **Node.js:** (v18 or later)
-   **npm:** (Node Package Manager)
-   **Ollama:** (with a model like `codegemma:latest` or a similar SQL-capable model)
-   **PostgreSQL:** (with a database you want to query)
-   **.env file:** (for storing environment variables)

## Installation

1.  **Clone the repository (or create a new project):**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2.  **Install the required npm packages:**

    ```bash
    npm install ollama @modelcontextprotocol/sdk dotenv
    npm install -D @modelcontextprotocol/server-postgres
    ```

## Configuration

1.  **Create a `.env` file** in the root directory of your project with the following content:

    ```plaintext
    DATABASE_URL=postgres://user:password@localhost:5432/dbname
    OLLAMA_MODEL=codegemma:latest # Optional: Specify your Ollama model
    ```

    -   Replace `postgres://user:password@localhost:5432/dbname` with your PostgreSQL connection string.
    -   Optionally, replace `codegemma:latest` with the Ollama model you want to use.

2.  **Ensure Ollama is running** and the specified model is available. You can run Ollama in your terminal:

    ```bash
    ollama serve
    ```

3.  **Ensure your Postgres Database is running** and accessible.

## Usage

1.  **Run the script:**

    ```bash
    node <your_script_name>.js
    ```

    Replace `<your_script_name>.js` with the actual name of your script file.

2.  **Ask questions:**

    The script will prompt you to ask questions about your database. Enter your questions in plain English.

    ```plaintext
    What would you like to know about your data? What are the names of all the users?
    ```

3.  **Exit:**

    Type `/exit` and press Enter to quit the script.

## Script Details

-   **Ollama Integration:** The script uses the `ollama` package to interact with the Ollama server.
-   **MCP Integration:** The script uses the `@modelcontextprotocol/sdk` to establish a connection to the database via `@modelcontextprotocol/server-postgres`.
-   **Environment Variables:** The script uses `dotenv` to load environment variables from the `.env` file.
-   **SQL Generation:** The script prompts Ollama to generate SQL queries based on user questions.
-   **Query Execution:** The script executes the generated SQL queries against the PostgreSQL database using MCP.
-   **Chat History:** The script maintains a chat history to provide context for subsequent questions.
-   **Error Handling:** The script includes error handling for database connection, query execution, and Ollama interaction.

## Error Handling

-   **Missing `.env` Variables:** The script checks for the `DATABASE_URL` environment variable and exits with an error if it's not found.
-   **Database Connection Errors:** The script attempts to connect to the database and handles connection errors.
-   **Query Execution Errors:** The script handles errors during SQL query execution and retries the query up to a maximum number of times.
-   **Ollama Errors:** The script handles errors from the Ollama API, such as model not found or connection issues.
-   **MCP Errors:** The script handles errors returned by the MCP, and attempts to create a new query.

## Cleanup

-   The script closes the database connection when exiting or encountering an error.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

This project is licensed under the [MIT License](LICENSE).