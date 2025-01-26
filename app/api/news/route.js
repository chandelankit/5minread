import News from "@models/news";
import { connectToDB } from "@utils/database";

export const GET = async (request) => {
    try {
        await connectToDB()

        const news = await News.find({})

        return new Response(JSON.stringify(news), { status: 200 })
    } catch (error) {
        return new Response("Failed to fetch all news", { status: 500 })
    }
}