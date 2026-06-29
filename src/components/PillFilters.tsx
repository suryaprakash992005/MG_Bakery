import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './PillFilters.css';

export interface PillFilterItem {
  id: string;
  label: string;
}

export interface PillFiltersProps {
  items: PillFilterItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
}

export const PillFilters: React.FC<PillFiltersProps> = ({
  items,
  activeId,
  onChange,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#2C1717',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#FAF8F5',
  pillTextColor = '#5B3535'
}) => {
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // Update scroll-fade indicators
  const updateScrollIndicators = () => {
    const el = scrollContainerRef.current;
    const outer = outerRef.current;
    if (!el || !outer) return;
    const atLeft = el.scrollLeft <= 4;
    const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
    outer.setAttribute('data-scroll-left', atLeft ? 'false' : 'true');
    outer.setAttribute('data-scroll-right', atRight ? 'false' : 'true');
  };

  // Auto-scroll active pill into view when activeId changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector('.pill-filter-btn.is-active') as HTMLElement;
    if (activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + (btnRect.left - containerRect.left) - containerRect.width / 2 + btnRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
    // Small delay to update after scroll
    setTimeout(updateScrollIndicators, 200);
  }, [activeId]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    updateScrollIndicators();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollIndicators, { passive: true });
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (container) {
        container.removeEventListener('scroll', updateScrollIndicators);
      }
    };
  }, [items, ease]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor
  } as React.CSSProperties;

  return (
    <div
      ref={outerRef}
      className={`pill-filters-outer ${className}`}
      data-scroll-left="false"
      data-scroll-right="true"
    >
      <div
        ref={scrollContainerRef}
        className="pill-filters-container"
        style={cssVars}
      >
        <ul className="pill-filters-list">
          {items.map((item, i) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`pill-filter-btn${isActive ? ' is-active' : ''}`}
                  onClick={() => onChange(item.id)}
                  onMouseEnter={() => !isActive && handleEnter(i)}
                  onMouseLeave={() => !isActive && handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillFilters;
