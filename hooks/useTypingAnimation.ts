import { useState, useEffect } from 'react';

/**
 * A custom hook that creates a typing animation effect
 * 
 * @param words Array of words to animate typing
 * @param isActive Whether the animation should be active
 * @param typingSpeed Speed for typing animation in ms
 * @param deletingSpeed Speed for deleting animation in ms
 * @param pauseTime Time to pause after typing a word in ms
 */
export function useTypingAnimation(
  words: string[],
  isActive: boolean,
  typingSpeed = 200,
  deletingSpeed = 100,
  pauseTime = 1000
) {
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const currentFullWord = words[wordIndex];
    
    const typeNextCharacter = () => {
      if (isDeleting) {
        // Deleting logic
        if (currentWord.length > 0) {
          setCurrentWord((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      } else {
        // Typing logic
        if (currentWord.length < currentFullWord.length) {
          setCurrentWord((prev) => currentFullWord.slice(0, prev.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      }
    };

    const timer = setTimeout(
      typeNextCharacter, 
      isDeleting ? deletingSpeed : typingSpeed
    );
    
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, wordIndex, words, isActive, typingSpeed, deletingSpeed, pauseTime]);

  return { currentWord };
}

export default useTypingAnimation; 