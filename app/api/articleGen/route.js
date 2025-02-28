import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";
import FormData from "form-data";

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_CONNECTION_STRING;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

export async function POST(request) {
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.R1_API_KEY
    });

    try {
        const { headline, fact1, fact2, fact3 } = await request.json();

        const completion = await openai.chat.completions.create({
        messages: [   { role: "system", content: "You are an author of articles, although they may not be correct" },
                        { role: "user", content: `You are an article generator. I will supply you a headline and three facts and you generate an article for it. Please write a lot and make up a bunch of stuff. Please only write the article. Do not rewite the headline or write it at the top. Headline: "${headline}" Fact 1: "${fact1}" Fact 2: "${fact2}" Fact 3: "${fact3}"` }
        ],
        model: "deepseek-chat",
        temperature: 1.5,
        });

        const imageChat = await openai.chat.completions.create({
            messages: [   { role: "system", content: "You are a prompt engineer for image generation" },
                            { role: "user", content: `You are a prompt engineer for image generation. I will supply you a headline and three facts and you generate a prompt for an image. Headline: "${headline}" Fact 1: "${fact1}" Fact 2: "${fact2}" Fact 3: "${fact3}"` }
            ],
            model: "deepseek-chat",
            temperature: 1.5,
        });

        const imagePrompt = imageChat.choices[0].message.content;

        const payload = {
            prompt: imagePrompt,
            output_format: "webp",
            aspect_ratio: "16:9"
          };

          const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/generate/core`,
            axios.toFormData(payload, new FormData()),
            {
              validateStatus: undefined,
              responseType: "arraybuffer",
              headers: { 
                Authorization: `Bearer ${process.env.STABILITY_API_KEY}`, 
                Accept: "image/*" 
              },
            },
          );

          if(response.status === 200) {
            console.log("Image generated");
          } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
          }

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const result = await client.db("fake-news").collection("articles").insertOne({
            headline: headline,
            fact1: fact1,
            fact2: fact2,
            fact3: fact3,
            article: completion.choices[0].message.content,
            image: response.data,
            imagePrompt: imagePrompt,
            date: new Date
        })
        let article = result.insertedId;
        return NextResponse.json({ article });
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to fetch data" },
          { status: 500 }
        );
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
}