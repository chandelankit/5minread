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

const PollCard = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (optionIndex) => {
    if (hasVoted) return;
    
    setSelectedOption(optionIndex);
    setHasVoted(true);
    onVote(poll._id, optionIndex);
  };

  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + (option.votes || 0), 0);
  };

  const getPercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className="poll_card my-bg">
      <div className="poll_header">
        <h3 className="poll_title">{poll.question}</h3>
        <p className="poll_source">Based on: {poll.sourceNews}</p>
      </div>
      
      <div className="poll_options">
        {poll.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleVote(index)}
            disabled={hasVoted}
            className={`poll_option ${
              hasVoted ? 'poll_option_voted' : 'poll_option_active'
            } ${selectedOption === index ? 'poll_option_selected' : ''}`}
          >
            <div className="poll_option_content">
              <span className="poll_option_text">{option.text}</span>
              {hasVoted && (
                <span className="poll_option_percentage">
                  {getPercentage(option.votes || 0)}%
                </span>
              )}
            </div>
            {hasVoted && (
              <div 
                className="poll_option_bar"
                style={{ width: `${getPercentage(option.votes || 0)}%` }}
              />
            )}
          </button>
        ))}
      </div>
      
      {hasVoted && (
        <div className="poll_stats">
          <span className="poll_total_votes">
            {getTotalVotes()} total votes
          </span>
        </div>
      )}
    </div>
  );
};

const PollSection = ({ polls, onVote, loading }) => {
  if (loading) {
    return (
      <div className="poll_section">
        <h2 className="poll_section_title">Public Opinion Polls</h2>
        <div className="poll_loading">
          <p>Creating polls based on trending news...</p>
          <div className="loading_spinner"></div>
        </div>
      </div>
    );
  }

  if (!polls || polls.length === 0) {
    return (
      <div className="poll_section">
        <h2 className="poll_section_title">Public Opinion Polls</h2>
        <div className="poll_loading">
          <p>No polls available yet. Please sign in to generate polls.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll_section">
      <h2 className="poll_section_title">Public Opinion Polls</h2>
      <div className="poll_grid">
        {polls.map((poll) => (
          <PollCard key={poll._id} poll={poll} onVote={onVote} />
        ))}
      </div>
    </div>
  );
};

const Feed = () => {
  const { data: session, status } = useSession();
  const [allPosts, setAllPosts] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(false);

  // Check if session is ready
  const isSessionReady = status === "authenticated" && session?.user?.id;

  // Sort news by upvotes (desc) and downvotes (asc)
  const sortNewsByVotes = (news) => {
    return [...news].sort((a, b) => {
      const aUpvotes = a.upvotes || 0;
      const bUpvotes = b.upvotes || 0;
      
      if (aUpvotes !== bUpvotes) {
        return bUpvotes - aUpvotes; // Higher upvotes first
      }
      
      const aDownvotes = a.downvotes || 0;
      const bDownvotes = b.downvotes || 0;
      return aDownvotes - bDownvotes; // Lower downvotes first
    });
  };

  // Generate polls from top 3 news
  const generatePolls = async (topNews) => {
    // Only generate polls if session is ready
    if (!isSessionReady) {
      console.log("Session not ready, skipping poll generation");
      return;
    }

    setPollsLoading(true);
    
    try {
      const response = await fetch("/api/generate-polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newsItems: topNews.slice(0, 3),
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedPolls = await response.json();
      
      // Save polls to database
      const savedPolls = [];
      for (const poll of generatedPolls) {
        const saveResponse = await fetch("/api/generate-polls/polls/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: poll.question,
            options: poll.options.map(opt => ({ text: opt, votes: 0 })),
            sourceNews: poll.sourceNews,
            newsId: poll.newsId,
            userId: session.user.id,
          }),
        });
        
        if (saveResponse.ok) {
          const savedPoll = await saveResponse.json();
          savedPolls.push(savedPoll);
        }
      }
      
      setPolls(savedPolls);
    } catch (error) {
      console.error("Error generating polls:", error);
    } finally {
      setPollsLoading(false);
    }
  };

  // Handle poll voting
  const handlePollVote = async (pollId, optionIndex) => {
    // Only allow voting if session is ready
    if (!isSessionReady) {
      console.log("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch("/api/generate-polls/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId,
          optionIndex,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        const updatedPoll = await response.json();
        
        // Update polls state
        setPolls(prevPolls => 
          prevPolls.map(poll => 
            poll._id === pollId ? updatedPoll : poll
          )
        );
      } else {
        const errorText = await response.text();
        console.error("Error voting on poll:", errorText);
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

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

          // Only save news if session is ready
          if (isSessionReady) {
            for (const news of scrapedNews) {
              await fetch("/api/news/new", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  news: news.title,
                  userId: session.user.id,
                  tag: news.desc,
                  newsimg: news.newsImg,
                }),
              });
            }
          }

          const newResponse = await fetch("/api/news");
          const newsData = await newResponse.json();
          setAllNews(newsData);
          
          // Generate polls for top news only if session is ready
          if (isSessionReady) {
            const sortedNews = sortNewsByVotes(newsData);
            if (sortedNews.length > 0) {
              generatePolls(sortedNews);
            }
          }
        } else {
          setAllNews(data);
          
          // Generate polls for top news only if session is ready
          if (isSessionReady) {
            const sortedNews = sortNewsByVotes(data);
            if (sortedNews.length > 0) {
              generatePolls(sortedNews);
            }
          }
        }
      } catch (error) {
        console.error("Error checking and scraping news:", error);
      }
    };

    const fetchExistingPolls = async () => {
      // Only fetch polls if session is ready
      if (!isSessionReady) {
        return;
      }

      try {
        const response = await fetch("/api/polls");
        if (response.ok) {
          const pollsData = await response.json();
          setPolls(pollsData);
        }
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchPosts();
    
    // Only run news and polls operations if session is ready
    if (isSessionReady) {
      checkAndScrape();
      fetchExistingPolls();
    }
  }, [isSessionReady]); // Add isSessionReady as dependency

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
                _id: newsItem._id,
                quote: newsItem.tag || "No headline available",
                name: newsItem.news || `Source ${index + 1}`,
                designation: "Latest News",
                src: newsItem.newsimg,
                upvotes: newsItem.upvotes || 0,
                downvotes: newsItem.downvotes || 0,
              }))
            : [
                {
                  _id: "placeholder-id",
                  quote: "Fetching latest news...",
                  name: "News Bot",
                  designation: "AI Reporter",
                  src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
                  upvotes: 0,
                  downvotes: 0,
                },
              ]
        }
      />

      <PollSection 
        polls={polls} 
        onVote={handlePollVote} 
        loading={pollsLoading || status === "loading"} 
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