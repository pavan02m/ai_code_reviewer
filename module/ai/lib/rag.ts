import {pinecodeIndex} from "@/lib/pinecone";
import {embed} from "ai";
import {google} from "@ai-sdk/google";

export const generateEmbedding = async (text:unknown) => {
    if (typeof text !== "string") {
        throw new Error("generateEmbedding: input is not a string");
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
        throw new Error("generateEmbedding: input is empty");
    }

    const { embedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: trimmed,
    });

    return embedding;
}


function normalizeContent(
    file: { path: string; content?: unknown }
): string | null {
    if (typeof file.content !== "string") return null;

    const trimmed = file.content.trim();
    if (trimmed.length === 0) return null;

    return `File: ${file.path}\n\n${trimmed}`;
}

export const indexCodebase = async (repoId: string, files:{path:string, content?:unknown}[]) => {
    const vectors = [];

    for(const file of files) {

        const normalized = normalizeContent(file);

        if (!normalized) {
            console.warn(`Skipping ${file.path}: empty or invalid content`);
            continue;
        }
        // const content  = `File : ${file.path}\n\n${file.content}`;

        const truncateContent  = normalized.slice(0, 8000);



        try {
            const embedding = await generateEmbedding(truncateContent);
            vectors.push({
                id : `${repoId}-${file.path.replace(/\//g, '_')}`,
                values: embedding,
                metadata :{
                    repoId,
                    path: file.path,
                    content: truncateContent,
                }
            });
        } catch (error) {
            console.error(`Failed to embed ${file.path}: ${error}`);
        }
    }

    if(vectors.length > 0){
        const batchSize = 100;

        for(let i = 0; i < vectors.length; i+=batchSize ){
            const batch = vectors.slice(i, i + batchSize);
            await pinecodeIndex.upsert(batch);
        }
    }

    console.log("Indexing completed successfully");
}

export const retrieveContext = async (query : string, repoId: string, topK : number = 5) => {

    if (!query || query.trim().length === 0) {
        return [];
    }
    const embedding = await generateEmbedding(query);

    const results = await pinecodeIndex.query({
        vector:embedding,
        filter:{repoId},
        topK,
        includeMetadata: true,
    })

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}