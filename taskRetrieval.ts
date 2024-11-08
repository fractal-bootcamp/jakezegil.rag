import dotenv from "dotenv";
import { initializeDatabase, pool, resetDatabase } from "./withMetadata/db.ts";
import { storeDocument, findSimilarDocuments } from "./withMetadata/embeddings.ts";
import openai from "openai";
import { tickets } from "./tickets";

dotenv.config();

const openaiClient = new openai({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  // Initialize database
  await resetDatabase();
  await initializeDatabase();

  // Store documents
  console.log("Storing tickets...");
  for (const ticket of tickets) {
    console.log(`Storing ticket ${ticket.id}`);
    await storeDocument(JSON.stringify(ticket), ticket.id.toString());
  }

  // Example query
  const query = "Specify the api rate limit to be 10k requests per hour";
  console.log("\nQuerying:", query);

  const similarDocs = await findSimilarDocuments(query, 1);
  console.log("\nSimilar documents:");
  similarDocs.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc}`);
  });

  // Complete the query using OpenAI
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Based on the context provided, update the ticket description.",
      },
      {
        role: "user",
        content: `Update the ticket description based on this context:
Query: "${query}"
Context:
${similarDocs.join("\n")}`,
      },
    ],
  });

  const updatedTicketDescription = completion.choices[0].message.content;

  const newTickets = tickets.map((ticket) =>
    ticket.id === parseInt(similarDocs[0][1])
      ? {
          ...ticket,
          description: updatedTicketDescription,
        }
      : ticket
  );
  console.log(newTickets);
  console.log(newTickets.find((ticket) => ticket.id === parseInt(similarDocs[0][1])));

  console.log("\nUpdated ticket description:");
  console.log(`"${completion.choices[0].message.content}"`);

  // Close the database connection
  await pool.end();
}

main().catch(console.error);
