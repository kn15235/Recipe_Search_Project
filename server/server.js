const express = require("express");
const cors = require("cors");
const OpenAi = require("openai");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipeStream", (req, res) => {
    const ingredients = req.query.ingredients;
    const cuisine = req.query.cuisine;
    const difficulty = req.query.difficulty;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    //send events 
    const sendEvents = (chunk) => {
        let chunkResponse;
        if (chunk.choices[0].finish_reason === "stop") {
            res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
        } else {
            if (
                chunk.choices[0].delta.role &&
                chunk.choices[0].delta.role === "assistant"
            ) {
                chunkResponse = {
                    action: "start",
                };
            } else {
                chunkResponse = {
                    action: "chunk",
                    chunk: chunk.choices[0].delta.content,
                };
            }
            res.write(`data: ${JSON.stringify(chunkResponse)}\n\n`);
        }
    };

    const prompt = [];
    prompt.push("Generate a recipe that incorporates the following details:");
    prompt.push(`[Ingredients: ${ingredients}]`);
    prompt.push(`[Cuisine: ${cuisine}]`);
    prompt.push(`[Difficulty: ${difficulty}]`);
    prompt.push(
        "Provide a detailed recipe including steps for preparation and cooking. Only use the ingredients."
    );
    prompt.push(
        "The recipe should highlight the fresh and vibrant flavors of the ingredients."
    );
    prompt.push(
        "Also give the recipe a suitable name in its local languagebased on cuisine"
    );
    prompt.push(
        "And the recipe should be based on what difficulty it is"
    );

    const messages = [
        {
            role: "system",
            content: prompt.join(" "),
        },
    ];

    fetchOpenAICompletionsStream(messages, sendEvents);
    req.on("close", () => {
        res.end();
    });

});

async function fetchOpenAICompletionsStream(messages, callback) {
    const OPENAI_API_KEY = "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";
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const aiModel = "gpt-4-1106-preview";

    try {
        openai.chat.completions.create({
            model: aiModel,
            messages: messages,
            stream: true,
        })

        for await (const chunk of completion) {
            callback(chunk);
        }
    } catch (error) {

    }
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
