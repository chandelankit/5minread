"use client";

import { useState, useEffect } from "react";

import PromptCard from "./PromptCard";
import { useSession } from "@node_modules/next-auth/react";
import NewsCard from "./NewsCard";

const PromptCardList = ({data, handleTagClick }) => {
  return (
    <div className='mt-16 prompt_layout'>
      {data.map((post) => (
        <PromptCard
          key={post._id}
          post={post}
          handleTagClick={handleTagClick}
        />
      ))}
    </div>
  );
};


const NewsCardList = ({data}) => {
  return (
    <div className='mt-16 prompt_layout'>
      {data.map((news) => (
        <NewsCard
          key={news._id}
          news={news}
        />
      ))}
    </div>
  );
};

const Feed = () => {
  const { data: session } = useSession();
  const [allPosts, setAllPosts] = useState([]);
  const [allNews,setAllNews] = useState([])

  // Search states
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);


  const fetchPosts = async () => {
    const response = await fetch("/api/prompt");
    const data = await response.json();

    setAllPosts(data);
  };

  const checkAndScrape = async() => {

    const response = await fetch("/api/news");
    const data = await response.json();
  
    if (!data || data.length === 0) {
      console.log("No news found, scraping started");
      const newsResponse = await fetch("/api/scraper");
      const scrapedNews = await newsResponse.json(); // Get the scraped news data
      console.log(scrapedNews)
  
      try {
  
        // Save each news item to the database
        for (const news of scrapedNews) {
          await fetch('/api/news/new', {
            method: "POST",
            body: JSON.stringify({
              news: news.title,
              userId: session?.user.id,
              tag: news.desc,
            }),
          });
        }
      } catch (error) {
        console.error("Error saving scraped news:", error);
      }
  
      // Re-fetch the data after scraping
      const newResponse = await fetch("/api/news");
      const newData = await newResponse.json();
      setAllNews(newData); // Set the state with the updated data
    } else {
      setAllNews(data); // Set the state with the existing data
    }
  };
  
  

  useEffect(() => {
    fetchPosts();
    // checkAndScrape();
  }, []);

  const filterPrompts = (searchtext) => {
    const regex = new RegExp(searchtext, "i"); // 'i' flag for case-insensitive search
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

    // debounce method
    setSearchTimeout(
      setTimeout(() => {
        const searchResult = filterPrompts(e.target.value);
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);

    const searchResult = filterPrompts(tagName);
    setSearchedResults(searchResult);
  };

  return (
    <section className='feed'>
      <form className='relative w-full flex-center'>
        <input
          type='text'
          placeholder='Search for a tag or a username'
          value={searchText}
          onChange={handleSearchChange}
          required
          className='search_input peer'
        />
      </form>

      {/* All Prompts */}
      {searchText ? (
        <PromptCardList
          data={searchedResults}
          handleTagClick={handleTagClick}
        />
      ) : (
        <PromptCardList data={allPosts} handleTagClick={handleTagClick} />
      )}

      <NewsCardList data={allNews} handleTagClick={handleTagClick} />

    </section>
  );
};

export default Feed;