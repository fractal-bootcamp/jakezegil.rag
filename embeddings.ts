import OpenAI from 'openai';
import { pool } from './db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text
  });
  return response.data[0].embedding;
}

function arrayToVector(arr: number[]): string {
  const formattedNumbers = arr.map(num => num.toFixed(8));
  return `[${formattedNumbers.join(',')}]`;
}


export async function storeDocument(content: string): Promise<void> {
  const embedding = await generateEmbedding(content);

  // transform embedding to pgvector compatible format
  const vectorString = arrayToVector(embedding);


  await pool.query(
    'INSERT INTO documents (content, embedding) VALUES ($1, $2::vector)',
    [content, vectorString]
  );
}

export async function findSimilarDocuments(query: string, limit: number = 3): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);

  // transform embedding to pgvector compatible format
  const vectorString = arrayToVector(queryEmbedding);

  const result = await pool.query(
    `SELECT content, embedding <-> $1::vector as distance
     FROM documents
     ORDER BY distance ASC
     LIMIT $2`,
    [vectorString, limit]
  );
  
  return result.rows.map(row => row.content);
}
