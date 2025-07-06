"use client";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export const AnimatedTestimonials = ({ testimonials, autoplay = false }) => {
  const [active, setActive] = useState(0);
  
  // Initialize votes state properly from testimonials
  const [votes, setVotes] = useState([]);
  
  // Track user's votes for each item: { itemId: 'upvote' | 'downvote' | null }
  const [userVotes, setUserVotes] = useState({});

  const isActive = (index) => index === active;

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleVote = async (type) => {
    const currentItemId = testimonials[active]._id;
    const currentUserVote = userVotes[currentItemId];
    
    // If user clicks the same vote type they already voted, remove their vote (toggle off)
    if (currentUserVote === type) {
      try {
        const res = await fetch(`/api/news/vote/${currentItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: type, action: "remove" }), // Tell backend to decrement
        });

        if (!res.ok) throw new Error("Vote toggle failed");

        const updated = await res.json();
        
        setVotes(prevVotes => 
          prevVotes.map((vote, index) => 
            index === active 
              ? {
                  _id: vote._id,
                  upvotes: updated.upvotes || 0,
                  downvotes: updated.downvotes || 0,
                }
              : vote
          )
        );
        
        // Remove the user's vote
        setUserVotes(prev => ({
          ...prev,
          [currentItemId]: null
        }));
        
      } catch (err) {
        console.error("Vote toggle failed", err);
      }
      return;
    }
    
    try {
      // For switching votes or first-time voting
      const requestBody = {
        type: type,
        action: "add"
      };
      
      // If user has a previous vote, include it so backend can handle the switch
      if (currentUserVote && currentUserVote !== type) {
        requestBody.previousVote = currentUserVote;
        requestBody.action = "switch";
      }

      const res = await fetch(`/api/news/vote/${currentItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error("Vote failed");

      const updated = await res.json();
      
      setVotes(prevVotes => 
        prevVotes.map((vote, index) => 
          index === active 
            ? {
                _id: vote._id,
                upvotes: updated.upvotes || 0,
                downvotes: updated.downvotes || 0,
              }
            : vote
        )
      );
      
      setUserVotes(prev => ({
        ...prev,
        [currentItemId]: type
      }));
      
    } catch (err) {
      console.error("Vote update failed", err);
    }
  };

  // Initialize votes when testimonials change
  useEffect(() => {
    if (testimonials && testimonials.length > 0) {
      const initialVotes = testimonials.map((testimonial) => ({
        _id: testimonial._id,
        upvotes: testimonial.upvotes || testimonial.upvote || 0,
        downvotes: testimonial.downvotes || testimonial.downvote || 0,
      }));
      setVotes(initialVotes);
      setActive(0);
    }
  }, [testimonials]);

  const handleUpVote = () => handleVote("upvote");
  const handleDownVote = () => handleVote("downvote");

  useEffect(() => {
    if (autoplay && testimonials.length > 1) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonials.length]);

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  // Don't render if no testimonials or votes not initialized
  if (!testimonials || testimonials.length === 0 || votes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-sm md:max-w-[1400px] mx-auto antialiased font-sans px-[1px] py-20">
      <div className="w-full relative grid grid-cols-1 md:grid-cols-2 gap-32">
        {/* Left: Image */}
        <div className="relative w-full h-[300px] md:h-full md:aspect-[2/1]">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: index === active ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index)
                    ? 999
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 origin-bottom"
              >
                <Image
                  src={testimonial.src}
                  alt={testimonial.name}
                  width={500}
                  height={500}
                  draggable={false}
                  className="h-full w-full rounded-xl object-fill"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right: Text */}
        <div className="flex flex-col justify-between py-4 h-full">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-xl font-semibold dark:text-white text-black">
              {testimonials[active].name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-500">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-base text-gray-500 mt-8 dark:text-neutral-300">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>

            <div className="flex gap-2 pt-12 md:pt-0">
              <button
                onClick={handleUpVote}
                className={`h-7 w-7 rounded-full flex items-center justify-center group/button transition-all duration-300 hover:scale-110 ${
                  userVotes[testimonials[active]._id] === 'upvote'
                    ? "bg-white" 
                    : "bg-black dark:bg-black"
                }`}
              >
                <img
                  src="/assets/icons/upvote.png"
                  alt="Upvote"
                  className={`group-hover/button:rotate-12 transition-transform duration-300 ${
                    userVotes[testimonials[active]._id] === 'upvote' ? "" : "invert"
                  }`}
                />
              </button>
              <span className="text-black dark:text-white">
                {votes[active]?.upvotes || 0}
              </span>
              <button
                onClick={handleDownVote}
                className={`h-7 w-7 rounded-full flex items-center justify-center group/button transition-all duration-300 hover:scale-110 ${
                  userVotes[testimonials[active]._id] === 'downvote'
                    ? "bg-white" 
                    : "bg-black dark:bg-black"
                }`}
              >
                <img
                  src="/assets/icons/downvote.png"
                  alt="Downvote"
                  className={`group-hover/button:rotate-12 transition-transform duration-300 ${
                    userVotes[testimonials[active]._id] === 'downvote' ? "" : "invert"
                  }`}
                />
              </button>
              <span className="text-black dark:text-white">
                {votes[active]?.downvotes || 0}
              </span>
            </div>
          </motion.div>

          <div className="flex justify-between pt-12 md:pt-10">
            <div className="flex gap-4 pt-12 md:pt-0">
              <button
                onClick={handlePrev}
                className="h-7 w-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group/button"
              >
                <IconArrowLeft className="h-5 w-5 text-black dark:text-neutral-400 group-hover/button:rotate-12 transition-transform duration-300" />
              </button>
              <button
                onClick={handleNext}
                className="h-7 w-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group/button"
              >
                <IconArrowRight className="h-5 w-5 text-black dark:text-neutral-400 group-hover/button:-rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};