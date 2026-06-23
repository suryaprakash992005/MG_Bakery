import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import './FlowingSelect.css';

export interface FlowingSelectOption {
  value: string;
  label?: string;
  image?: string;
}

interface FlowingSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FlowingSelectOption[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  fontSize?: string;
}

export const FlowingSelect: React.FC<FlowingSelectProps> = ({
  label,
  value,
  onChange,
  options,
  speed = 15,
  textColor = '#F5E6D3',
  bgColor = '#2C1717',
  marqueeBgColor = '#D4AF37',
  marqueeTextColor = '#2C1717',
  borderColor = '#D4AF37',
  fontSize = '1.1rem'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="flowing-select-container" ref={containerRef}>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-brand-brown-800/50 mb-3">
          {label}
        </span>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flowing-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label || selectedOption?.value}</span>
        <ChevronDown className={`w-4 h-4 text-brand-gold-850 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="flowing-select-dropdown" style={{ backgroundColor: bgColor, borderColor }}>
          <div className="flowing-select-menu" role="listbox">
            {options.map((option, idx) => (
              <FlowingSelectItem
                key={option.value || idx}
                option={option}
                isSelected={option.value === value}
                onSelect={() => handleSelect(option.value)}
                speed={speed}
                textColor={textColor}
                marqueeBgColor={marqueeBgColor}
                marqueeTextColor={marqueeTextColor}
                borderColor={borderColor}
                fontSize={fontSize}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface FlowingSelectItemProps {
  option: FlowingSelectOption;
  isSelected: boolean;
  onSelect: () => void;
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  fontSize: string;
}

const FlowingSelectItem: React.FC<FlowingSelectItemProps> = ({
  option,
  isSelected,
  onSelect,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  fontSize
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const text = option.label || option.value;
  const image = option.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80';

  const animationDefaults = { duration: 0.4, ease: 'expo.out' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-marquee__part') as HTMLElement;
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      const parentWidth = itemRef.current ? itemRef.current.offsetWidth : 300;

      const needed = Math.ceil(parentWidth / (contentWidth || 100)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    const timeoutId = setTimeout(calculateRepetitions, 20);
    window.addEventListener('resize', calculateRepetitions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateRepetitions);
    };
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-marquee__part') as HTMLElement;
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };

    const timer = setTimeout(setupMarquee, 50);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div
      ref={itemRef}
      className={`flowing-select-item ${isSelected ? 'is-selected' : ''}`}
      style={{ borderColor }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flowing-select-item-link" style={{ color: textColor }}>
        {text}
      </div>
      
      <div className="flowing-marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="flowing-marquee__inner-wrap">
          <div className="flowing-marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="flowing-marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span style={{ fontSize }}>{text}</span>
                <div className="flowing-marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingSelect;
