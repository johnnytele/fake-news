import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

export async function GET(r, { params }) { 
  try {
    console.log("params");
    const { slug } = await params

    console.log("slug:", slug);

    await client.connect();
    const db = client.db("fake-news");

    // Convert id to ObjectId
    const article = await db.collection("articles").findOne(
      {_id: new ObjectId(slug)}
    );


    if (!article) {
      return NextResponse.json({ error: "Article not foundd" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.log(error);
    console.error("Error fetching article:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
