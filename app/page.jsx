"use client";
import Feed from "@components/Feed"

const Home = () => {
  return (
    <section className="w-full flex-center flex-col">
        <h1 className='head_text text-center'>
        
      <br className='max-md:hidden' />
      <span className='orange_gradient text-center'> Timely News,Always Relevant.</span>
    </h1>
    <p className='desc text-center'>
    Providing Insightful and Timely News to Keep You Informed and Ahead.
    </p>

    <Feed/>
    </section>
  )
}

export default Home