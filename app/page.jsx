"use client";
import Feed from "@components/Feed"

const Home = () => {
  return (
    <section className="w-full flex-center flex-col">
        <h1 className='head_text text-center'>
            Find and share 
      <br className='max-md:hidden' />
      <span className='orange_gradient text-center'> AI-Powered Prompts</span>
    </h1>
    <p className='desc text-center'>
      Promptsearch provides community of people who share creative and useful prompts and you can join us too !!
    </p>

    <Feed/>
    </section>
  )
}

export default Home