"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PromptCard from "./PromptCard";
import { AnimatedTestimonials } from "./AnimatedTestimonials";

const PromptCardList = ({ data, handleTagClick }) => (
  <div className="mt-16 prompt_layout">
    {data.map((post) => (
      <PromptCard key={post._id} post={post} handleTagClick={handleTagClick} />
    ))}
  </div>
);

const Feed = () => {
  const { data: session } = useSession();
  const [allPosts, setAllPosts] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/prompt");
        const data = await response.json();
        setAllPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const checkAndScrape = async () => {
      try {
        const response = await fetch("/api/news");
        const data = await response.json();

        if (!data || data.length === 0) {
          console.log("No news found, scraping started");
          const newsResponse = await fetch("/api/scraper");
          const scrapedNews = await newsResponse.json();

          for (const news of scrapedNews) {
            await fetch("/api/news/new", {
              method: "POST",
              body: JSON.stringify({
                news: news.title,
                userId: session?.user.id,
                tag: news.desc,
                newsimg: news.newsImg,
              }),
            });
          }

          const newResponse = await fetch("/api/news");
          setAllNews(await newResponse.json());
        } else {
          setAllNews(data);
        }
      } catch (error) {
        console.error("Error checking and scraping news:", error);
      }
    };

    fetchPosts();
    checkAndScrape();
  }, []);

  const filterPrompts = (searchText) => {
    const regex = new RegExp(searchText, "i");
    return allPosts.filter(
      (item) =>
        regex.test(item.creator.username) ||
        regex.test(item.tag) ||
        regex.test(item.prompt)
    );
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    setSearchTimeout(
      setTimeout(() => {
        setSearchedResults(filterPrompts(e.target.value));
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);
    setSearchedResults(filterPrompts(tagName));
  };

  return (
    <section className="feed">
      <AnimatedTestimonials
        testimonials={
          allNews.length > 0
            ? allNews.map((newsItem, index) => ({
                quote: newsItem.tag || "No headline available",
                name: newsItem.news || `Source ${index + 1}`,
                designation: "Latest News",
                src: newsItem.newsimg,
              }))
            : [
                {
                  quote: "Fetching latest news...",
                  name: "News Bot",
                  designation: "AI Reporter",
                  src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
                },
              ]
        }
      />
      <form className="relative w-full flex-center">
        <input
          type="text"
          placeholder="Search for a comment or username"
          value={searchText}
          onChange={handleSearchChange}
          required
          className="search_input peer"
        />
      </form>

      {searchText ? (
        <PromptCardList data={searchedResults} handleTagClick={handleTagClick} />
      ) : (
        <PromptCardList data={allPosts} handleTagClick={handleTagClick} />
      )}
    </section>
  );
};

export default Feed;
