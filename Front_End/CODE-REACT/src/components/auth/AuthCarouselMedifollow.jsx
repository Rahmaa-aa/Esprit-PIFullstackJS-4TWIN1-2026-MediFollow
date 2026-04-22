import React, { useState } from "react";
import { Carousel } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { authCarouselSlides } from "../../views/landing/landingPaths";

/**
 * Carousel gauche des pages auth : scènes de soins, voile aux couleurs template (voir SCSS).
 * Mode contrôlé : les points (indicateurs) changent bien de slide au clic.
 * @param {number} [interval=4000]
 * @param {{ titleKey: string, descKey: string } | Array<{ titleKey: string, descKey: string }>} captionKeys — un objet (même texte sur les 3 slides) ou un tableau de 3 paires de clés i18n.
 */
export default function AuthCarouselMedifollow({ interval = 4000, captionKeys }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = authCarouselSlides();
  const perSlide = Array.isArray(captionKeys) ? captionKeys : null;
  const single = !perSlide ? captionKeys : null;

  return (
    <Carousel
      id="auth-carousel-medifollow"
      className="auth-carousel-medifollow"
      activeIndex={activeIndex}
      onSelect={(idx) => setActiveIndex(idx)}
      interval={interval}
      controls={false}
      indicators
      slide
      keyboard
      touch
    >
      {slides.map((slide, i) => {
        const keys = perSlide ? perSlide[i] : single;
        return (
          <Carousel.Item key={`${slide.src}-${i}-${slide.objectPosition}`}>
            <div className="auth-carousel-slide-wrap">
              <img
                src={slide.src}
                className="d-block w-100 auth-carousel-photo"
                alt=""
                style={{ objectPosition: slide.objectPosition }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
            <div className="carousel-caption-container auth-carousel-caption">
              <h4 className="mb-1 mt-3 text-white">{t(keys.titleKey)}</h4>
              <p className="pb-5">{t(keys.descKey)}</p>
            </div>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
}
