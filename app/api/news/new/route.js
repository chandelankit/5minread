import News from "@models/news";
import { connectToDB } from "@utils/database";

export const POST = async (request) => {
    const { userId, news, tag, newsimg } = await request.json();

    try {
        await connectToDB();
        const newNews = new News({ creator: userId, news, tag, newsimg });

        await newNews.save();
        return new Response(JSON.stringify(newNews), { status: 201 })
    } catch (error) {
        return new Response("Failed to create a new news", { status: 500 });
    }
}