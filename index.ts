import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import { storeDocument, findSimilarDocuments } from './embeddings.ts';

dotenv.config();

async function main() {
  // Initialize database
  await initializeDatabase();
  
  // Example documents
  const documents = [
    "TypeScript is a programming language developed by Microsoft",
    "JavaScript is a widely-used programming language",
    "Python is known for its simplicity and readability",
    "Rust is a systems programming language focused on safety",
    "Go is developed by Google for cloud and networking",
    "Java was originally developed by Sun Microsystems, now owned by Oracle",
    "Swift is Apple's programming language for iOS development",
    "Kotlin is developed by JetBrains and officially supported by Google for Android",
    "C# is Microsoft's language for the .NET ecosystem",
    "PHP powers a large portion of web servers and was created by Rasmus Lerdorf",
    "Ruby was created by Yukihiro Matsumoto with a focus on programmer happiness",
    "Scala combines object-oriented and functional programming on the JVM",
    "Dart is Google's language for building multi-platform applications",
    "F# is Microsoft's functional programming language",
    "Julia is designed for numerical analysis and computational science",
    "Elixir runs on the Erlang VM and is great for concurrent systems",
    "Haskell is a purely functional programming language",
    "R is popular for statistical computing and data analysis",
    "COBOL is still used in many legacy business systems",
    "Assembly language provides direct hardware access"
  ];
  
  // Store documents
  console.log('Storing documents...');
  for (const doc of documents) {
    await storeDocument(doc);
  }
  
  // Example query
  const query = "What programming languages are built by big tech companies?";
  console.log('\nQuerying:', query);
  
  const similarDocs = await findSimilarDocuments(query);
  console.log('\nSimilar documents:');
  similarDocs.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc}`);
  });
}

main().catch(console.error);