'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contacts";
import React from "react";

interface NavLink {
  to: string;
  label: string;
}

const Footer: React.FC = () => {
  const navLinks: NavLink[] = [
    { to: 'home', label: 'Home' },
    { to: 'process-section', label: 'Process' },
    { to: 'features-section', label: 'Features' },
  ];

  return (
      <footer className="bg-[#F0F0F0] mt-32">
        {/* CONNECT */}
        <section className="bg-[#FFFFFF]">
          <section className="max-w-7xl justify-center mx-auto">
            <section
                className="md:flex mx-auto py-10 md:px-10 px-2
          justify-between bg-[#ffffff] grid"
            >
              {/* LEFT */}
              <div
                  className="md:border-r-2 border-zinc-100
            max-xl:px-10 xl:pr-10 py-10 md:w-1/2 grid max-md:border-b-2"
              >
                <h2
                    className="text-5xl text-left font-serif tracking-normal
              mb-8"
                >
                  Get Early Access To our Beta Model
                </h2>
              </div>
              {/* RIGHT */}
              <div className="grid max-xl:px-10 xl:pl-10 py-10 md:w-1/2">
                <h2 className="font-ivy text-2xl mb-2">
                  SIGN UP CONNECT WITH OUR UPDATES
                </h2>
                <p className="mb-10 text-zinc-400">
                  We respect your privacy, so we never share your info.
                </p>
                <div className="relative w-full flex group">
                  <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full rounded-md px-6 py-4 bg-[#F1F1F1]
                  text-md focus:ring-0 placeholder:text-black"
                  />
                  <ArrowUpRight
                      className="absolute right-4 top-1/2 transform group-hover:text-black
                  -translate-y-1/2 text-slate-500 hover:cursor-pointer duration-300"
                  />
                </div>
              </div>
            </section>
          </section>
        </section>
        <section className="max-w-7xl justify-center mx-auto">
          {/* NAV LINKS */}
          <section
              className="text-center xl:flex py-10 md:px-10 px-6
        xl:justify-between xl:grid-cols-2 mx-auto"
          >
            {/* LEFT */}
            <div
                className="xl:justify-between w-2/2 xl:w-1/2 grid sm:flex
          xl:border-r-2 xl:pr-16 xl:mx-auto mb-5 xl:mb-0 sm:gap-10 xl:gap-0
          justify-center max-sm:border-b-2"
            >
              <Link
                  className="bg-black py-3 text-center text-white px-5
            rounded-xl hover:bg-slate-600 duration-300 shadow-md flex
            items-center"
                  href={`/service`}
              >
                <Image
                    src="/assets/footer/device-message.png"
                    alt="icon-message"
                    width={30}
                    height={30}
                    className="pr-2"
                />
                Chatbot
              </Link>
              {navLinks.map((link) => (
                  <a
                      key={link.to}
                      href={`#${link.to}`}
                      className="relative cursor-pointer transition-all
                ease-in-out before:transition-[width] before:ease-in-out
                before:duration-300 before:absolute before:bg-black
                before:origin-center before:h-[1px] before:w-0
                hover:before:w-[50%] before:bottom-4 before:left-[45%]
                after:transition-[width] after:ease-in-out after:duration-300
                after:absolute after:bg-black after:origin-center after:h-[1px]
                after:w-0 hover:after:w-[50%] after:bottom-4 after:right-[45%]
                py-4"
                  >
                    {link.label}
                  </a>
              ))}
            </div>
            {/* RIGHT */}
            <div
                className="xl:justify-between w-2/2 xl:w-1/2 grid gap-5
          sm:flex xl:pl-16 xl:mx-auto sm:gap-10 xl:gap-0 justify-center"
            >
              <button className="hover:opacity-75 flex my-auto">
                <Mail className="text-black pr-2" />
                {CONTACT_EMAIL}
              </button>
              <div
                  className="flex items-center justify-center rounded-full
            bg-stone-300 w-12 h-12 hover:opacity-75 duration-300 shadow-sm
            hover:-translate-y-1 hover:cursor-pointer max-sm:mx-auto"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-black text-2xl"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
            </div>
          </section>
          {/* COPYRIGHT */}
          <section
              className="text-center flex mx-auto justify-center
        border-t-2 py-5"
          >
            <p>&copy; Copyright 2024 | LulAI . All rights reserved. </p>
          </section>
        </section>
      </footer>
  );
};

export default Footer;