import { useEffect } from 'react';

/**
 * A custom React hook to cycle the document title.
 * @param title - A title.
 * @param intervalDuration - The time in milliseconds between title changes. Defaults to 300ms.
 */
export const useTitleCarousel = (title: string, intervalDuration= 1000) => {
  useEffect(() => {
    const carouselTitle = title + " - "
    let currentIndex = 0;
    
    const shiftTitle = carouselTitle.slice(currentIndex) + carouselTitle.slice(0, currentIndex)

    document.title = title;

    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % carouselTitle.length;
      const shiftTitle = carouselTitle.slice(currentIndex) + carouselTitle.slice(0, currentIndex);
      document.title = shiftTitle;
    }, intervalDuration);

    return () => {
      clearInterval(intervalId);
    };
  }, [title, intervalDuration]);
};