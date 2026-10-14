import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { AppEvent } from "@/types/event";
import ShadyBorder from "./ShadyBorder";

interface EventCarouselProps {
  events: AppEvent[];
  renderEventCard: (event: AppEvent) => React.ReactNode;
}

export function EventCarousel({ events, renderEventCard }: EventCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (events.length === 0) {
    return <div className="py-8 text-center">No events to display</div>;
  }

  return (
    <div className="relative">
      {/* Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {events.map((event) => (
            <div className="min-w-0 flex-[0_0_100%] px-1" key={event.id}>
              {renderEventCard(event)}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="mt-3 flex h-5 items-center justify-center gap-2">
        {scrollSnaps.map((snap, index) => (
          <button aria-label={`Go to slide ${index + 1}`} key={snap} onClick={() => scrollTo(index)} type="button">
            <ShadyBorder
              className={`rounded-full transition-all duration-200 ${index === selectedIndex ? "bg-pink-400" : "bg-gray-300 hover:bg-gray-400"}`}
              overlayClassname="rounded-full border-2"
              size={index === selectedIndex ? 16 : 12}
            ></ShadyBorder>
          </button>
        ))}
      </div>
    </div>
  );
}
