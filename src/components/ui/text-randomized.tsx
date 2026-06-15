"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

const lettersAndSymbols = "abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,";

interface AnimatedTextProps {
  text: string;
  /** Wrap in any Typography (or element) — animated text is injected as its children. */
  children: React.ReactElement;
}

export function RandomizedTextEffect({ text, children }: AnimatedTextProps) {
  const { ref, inView } = useInView(0.5);
  const [animatedText, setAnimatedText] = useState("");
  const hasAnimated = useRef(false);

  const getRandomChar = useCallback(
    () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
    []
  );

  const animateText = useCallback(async () => {
    const duration = 50;
    const revealDuration = 80;
    const initialRandomDuration = 300;

    const generateRandomText = () =>
      text
        .split("")
        .map(() => getRandomChar())
        .join("");

    setAnimatedText(generateRandomText());

    const endTime = Date.now() + initialRandomDuration;
    while (Date.now() < endTime) {
      await new Promise((resolve) => setTimeout(resolve, duration));
      setAnimatedText(generateRandomText());
    }

    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, revealDuration));
      setAnimatedText(
        (prevText) =>
          text.slice(0, i + 1) +
          prevText
            .slice(i + 1)
            .split("")
            .map(() => getRandomChar())
            .join("")
      );
    }
  }, [text, getRandomChar]);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      animateText();
    }
  }, [inView, animateText]);

  return <div ref={ref}>{React.cloneElement(children, {}, animatedText || " ")}</div>;
}
