"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const NewsCard = ({ news}) => {

  return (
    <div className='prompt_card'>
      <p className='my-4 font-satoshi text-sm text-gray-700'>{news.news}</p>
      <p
        className='font-inter text-sm blue_gradient cursor-pointer'
        onClick={() => handleTagClick && handleTagClick(news.tag)}
      >
        {news.tag}
      </p>
    </div>
  );
};

export default NewsCard;