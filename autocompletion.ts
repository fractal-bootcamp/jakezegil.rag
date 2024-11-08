import dotenv from "dotenv";
import { initializeDatabase, pool, resetDatabase } from "./plain/db.ts";
import { storeDocument, findSimilarDocuments } from "./plain/embeddings.ts";
import openai from "openai";

dotenv.config();

const openaiClient = new openai({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  // Initialize database
  await initializeDatabase();
  await resetDatabase();

  // Example documents
  const documents = [
    "The quantum mechanical properties of superconducting materials enable zero electrical resistance at extremely low temperatures.",
    "A caltech swag store that sells orange kitten plushies of the quantum mechanical variety.",
    "A fluffy orange kitten played with a ball of yarn while purring contentedly in a warm sunbeam.",
    "The principles of quantum entanglement suggest particles can remain connected regardless of distance.",
    "An orange tabby cat lounged lazily on the windowsill of the quantum physics laboratory.",
    "Researchers discovered a new superconducting material that works at room temperature.",
    "The campus bookstore started selling quantum physics themed plush toys and accessories.",
    "A ginger cat wandered through the university halls, stopping to nap in the physics department.",
    "String theory proposes the universe consists of tiny vibrating strings in multiple dimensions.",
    "The quantum computing lab adopted an orange shelter cat as their unofficial mascot.",
    "Dark matter's gravitational effects can be observed but the substance remains undetectable.",
    "Students decorated the physics lounge with cat-themed quantum mechanics posters.",
    "The Heisenberg uncertainty principle states position and momentum cannot be precisely known.",
    "An orange kitten watched intently as the professor drew quantum diagrams on the whiteboard.",
    "Scientists achieved quantum teleportation of information between two distant particles.",
    "The department's orange cat seemed fascinated by the quantum interference patterns.",
    "Quantum tunneling allows particles to pass through barriers that classical physics prohibits.",
    "A ginger kitten pawed curiously at the holographic display of atomic orbitals.",
  ];

  // Store documents
  console.log("Storing documents...");
  for (const doc of documents) {
    await storeDocument(doc);
  }

  // Example query
  const query = "I need to buy food for the quantum computing lab's";
  console.log("\nQuerying:", query);

  const similarDocs = await findSimilarDocuments(query, 4);
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
          "You are a helpful assistant. Based on the context provided, complete the user's query in a natural way.",
      },
      {
        role: "user",
        content: `Complete this query naturally based on this context:
Query: "${query}"
Context:
${similarDocs.join("\n")}`,
      },
    ],
  });

  console.log("\nCompleted query:");
  console.log(`"${query}${completion.choices[0].message.content}"`);

  // Close the database connection
  await pool.end();
}

main().catch(console.error);
