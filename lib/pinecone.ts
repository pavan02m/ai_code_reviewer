import {Pinecone} from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_DB_API_KEY!,
});

export const pinecodeIndex = pinecone.index("ai-code-reviewer-vector-embedding-v1");