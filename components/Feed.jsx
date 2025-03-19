"use client";
import { useState, useEffect } from "react";
import PromptCard from "./PromptCard";
import { useSession } from "@node_modules/next-auth/react";
import NewsCard from "./NewsCard";
import { AnimatedTestimonials } from "./AnimatedTestimonials";
import {GlowingEffect} from "./GlowingEffect"
import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";

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

export function GlowingEffectDemoSecond({ items }) {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      {items.map((item, index) => (
        <GridItem key={index} {...item} />
      ))}
    </ul>
  );
}

const GridItem = ({ area, icon, title, description }) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={5}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl font-semibold md:text-2xl text-black dark:text-white">
                {title}
              </h3>
              <h2 className="text-sm md:text-base text-black dark:text-neutral-400">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

// Example Usage
const items = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: <Box className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Do things the right way",
    description: "Running out of copy so I'll write anything.",
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Settings className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "The best AI code editor ever.",
    description: "Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me.",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Lock className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "You should buy Aceternity UI Pro",
    description: "It's the best money you'll ever spend",
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <Sparkles className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "This card is also built by Cursor",
    description: "I'm not even kidding. Ask my mom if you don't believe me.",
  },
  {
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
    icon: <Search className="h-4 w-4 text-black dark:text-neutral-400" />,
    title: "Coming soon on Aceternity UI",
    description: "I'm writing the code as I record this, no shit.",
  },
];


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
              newsimg: news.newsImg
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
  const defaultTestimonials = [
    {
      quote: "Fetching latest news...",
      name: "News Bot",
      designation: "AI Reporter",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
    },
  ];
  
  const testimonials = allNews.length > 0
    ? allNews.map((newsItem, index) => ({
        quote: newsItem.tag || "No headline available", // Fallback text
        name: newsItem.news ||`Source ${index + 1}`,
        designation: "Latest News",
        src: newsItem.newsimg,
      }))
    : defaultTestimonials; // Use default while loading
  
  
  

  useEffect(() => {
    fetchPosts();
    checkAndScrape();
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
      <AnimatedTestimonials testimonials={testimonials}/>
      <form className='relative w-full flex-center'>
        <input
          type='text'
          placeholder='Search for a comment or username'
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
      <GlowingEffectDemoSecond items={items} />;

    </section>
  );
};
export default Feed;