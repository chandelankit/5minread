"use client";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export const AnimatedTestimonials = ({ testimonials, autoplay = false }) => {

  const [votes, setVotes] = useState(
  testimonials.map((t) => ({
    _id: t._id,
    upvote: t.upvote || 0,
    downvote: t.downvote || 0,
  }))
);

  const [active, setActive] = useState(0);
const isActive = (index) => {
  return index === active;
};


  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

const handleVote = async (type) => {
  const updated = votes.map((v, i) =>
    i === active
      ? { ...v, [type]: v[type] + 1 }
      : v
  );
  setVotes(updated);

  try {
    await fetch(`/api/news/vote/${testimonials[active]._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
  } catch (err) {
    console.error("Vote update failed", err);
  }
};

const handleUpVote = () => handleVote("upvote");
const handleDownVote = () => handleVote("downvote");

useEffect(() => {
  setVotes(
    testimonials.map((t) => ({
      _id: t._id,
      upvote: t.upvote || 0,
      downvote: t.downvote || 0,
    }))
  );
  setActive(0);
}, [testimonials]);


  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };
  return (
    <div className="w-full max-w-sm md:max-w-[1400px] mx-auto antialiased font-sans px-[1px] md:px-[1px] lg:px-[1px] py-20">
      <div className="w-full relative grid grid-cols-1 md:grid-cols-2 gap-32">
        {" "}
        {/* Increased gap here */}
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
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
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
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
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
                className={`h-7 w-7 rounded-full flex items-center justify-center group/button ${
                  votes[active]?.upvote > 0 ? "bg-white" : "bg-gray-100 dark:bg-neutral-800"
                }`}
              >
                <img
                  src="/assets/icons/upvote.png"
                  alt="Upvote"
                  className={`group-hover/button:rotate-12 transition-transform duration-300 ${
                    votes[active]?.upvote > 0 ? "" : "invert"
                  }`}
                />
              </button>
              <span className="text-black dark:text-white">{votes[active]?.upvote}</span>
              <button
                onClick={handleDownVote}
                className={`h-7 w-7 rounded-full flex items-center justify-center group/button ${
                  votes[active]?.downvote > 0 ? "bg-white" : "bg-gray-100 dark:bg-neutral-800"
                }`}
              >
                <img
                  src="/assets/icons/downvote.png"
                  alt="Downvote"
                  className={`group-hover/button:rotate-12 transition-transform duration-300 ${
                    votes[active]?.downvote > 0 ? "" : "invert"
                  }`}
                />
              </button>
              <span className="text-black dark:text-white">{votes[active]?.downvote}</span>
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
