import {pinecodeIndex} from "@/lib/pinecone";
import {embed} from "ai";
import {google} from "@ai-sdk/google";

export const generateEmbedding = async (text:string) => {
        const {embedding} = await embed({
            model: google.textEmbeddingModel("text-embedding-004"),
            value: text,
        })

    return embedding;
}

export const indexCodebase = async (repoId: string, files:{path:string, content:string}[]) => {
    const vectors = [];

    for(const file of files) {
        const content  = `File : ${file.path}\n\n${file.content}`;

        const truncateContent  = content.slice(0, 8000);

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

export const retrieveContext = async (query : string, repoId: string, topK : number) => {
    const embedding = await generateEmbedding(query);

    const results = await pinecodeIndex.query({
        vector:embedding,
        filter:{repoId},
        topK,
        includeMetadata: true,
    })


    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}