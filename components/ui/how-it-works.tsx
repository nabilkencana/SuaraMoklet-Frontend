"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "red" | "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
  index?: number;
  innerRef?: React.Ref<HTMLDivElement>;
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className = "",
  rotate = "",
  colors: customColors,
  index = 0,
  innerRef,
}: CardProps) => {
  const defaultBgColors = {
    red: "bg-red-50/80 dark:bg-red-500/10",
    orange: "bg-orange-50/80 dark:bg-orange-500/10",
    blue: "bg-blue-50/80 dark:bg-blue-500/10",
    purple: "bg-purple-50/80 dark:bg-purple-500/10",
  };
  const defaultTextColors = {
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-500 dark:text-orange-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  };
  const defaultBorderColors = {
    red: "border-red-100 dark:border-red-500/20",
    orange: "border-orange-100 dark:border-orange-500/20",
    blue: "border-blue-100 dark:border-blue-500/20",
    purple: "border-purple-100 dark:border-purple-500/20",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <m.div
      ref={innerRef}
      initial={{ opacity: 0, y: 45, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={`relative w-full md:w-[300px] lg:w-[320px] transition-shadow duration-300 hover:z-30 cursor-pointer group ${rotate} ${className}`}
    >
      <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-[28px] shadow-[0px_10px_25px_-5px_rgba(0,0,0,0.07)] group-hover:shadow-[0px_20px_35px_-5px_rgba(0,0,0,0.12)] dark:shadow-none border border-neutral-100 dark:border-neutral-800 transition-all duration-300">
        <Pin className={`w-8 h-8 ${textColor} z-20 mb-5 mx-auto drop-shadow-xs transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`} />
        <div
          className={`${bgColor} border ${borderColor} rounded-[18px] p-5 h-full flex flex-col relative overflow-hidden transition-colors duration-300`}
        >
          <span
            className={`${textColor} text-4xl font-handwriting mb-4 tracking-wider transition-transform duration-300 group-hover:translate-x-1`}
            style={{
              fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
            }}
          >
            {number}
          </span>
          <h3 className="text-xl lg:text-2xl font-bold text-neutral-800 dark:text-neutral-100 leading-snug mb-2 group-hover:text-neutral-900 transition-colors">
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </m.div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "red" | "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[10%] lg:left-[12%]", rotate: "rotate-[6deg]" },
  {
    className: "md:absolute md:top-[120px] md:right-[10%] lg:right-[12%]",
    rotate: "-rotate-[6deg]",
  },
  { className: "md:absolute md:top-[450px] md:left-[10%] lg:left-[12%]", rotate: "rotate-[6deg]" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "-rotate-[6deg]",
  },
  { className: "md:absolute md:top-[850px] md:left-[10%] lg:left-[12%]", rotate: "rotate-[6deg]" },
];

export default function HowItWorks({
  features,
  className = "",
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Tulis Laporan",
      description:
        "Sampaikan keluhan atau ide perbaikanmu secara jelas beserta foto bukti pendukung.",
      colorTheme: "red",
    },
    {
      title: "Proses Penanganan",
      description:
        "Unit terkait langsung memverifikasi dan menindaklanjuti keluhan secara terkoordinasi.",
      colorTheme: "blue",
    },
    {
      title: "Solusi & Evaluasi",
      description:
        "Pantau progres transparan, terima solusi resmi, dan berikan penilaian kepuasan.",
      colorTheme: "orange",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 800;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 920;
  else height = 1150;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const fallbackPaths = React.useMemo(() => {
    if (data.length <= 1) return [];
    if (data.length === 2) {
      return ["M 370 160 C 500 160, 500 260, 630 260"];
    }
    if (data.length === 3) {
      return [
        "M 370 160 C 500 160, 500 260, 630 260",
        "M 630 310 C 500 310, 500 580, 370 580",
      ];
    }
    return [
      "M 370 160 C 500 160, 500 260, 630 260",
      "M 630 310 C 500 310, 500 580, 370 580",
      "M 370 630 C 500 630, 500 750, 630 750",
    ];
  }, [data.length]);

  const [svgDimensions, setSvgDimensions] = React.useState({ width: 1000, height });
  const [paths, setPaths] = React.useState<string[]>(fallbackPaths);

  const updatePaths = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight || height;
    if (cWidth === 0) return;

    setSvgDimensions({ width: cWidth, height: cHeight });

    const newPaths: string[] = [];

    for (let i = 0; i < data.length - 1; i++) {
      const cardA = cardRefs.current[i];
      const cardB = cardRefs.current[i + 1];
      if (!cardA || !cardB) continue;

      const aLeft = cardA.offsetLeft;
      const aTop = cardA.offsetTop;
      const aWidth = cardA.offsetWidth;
      const aHeight = cardA.offsetHeight;

      const bLeft = cardB.offsetLeft;
      const bTop = cardB.offsetTop;
      const bWidth = cardB.offsetWidth;
      const bHeight = cardB.offsetHeight;

      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;
      let cp1X: number;
      let cp1Y: number;
      let cp2X: number;
      let cp2Y: number;

      if (aLeft < bLeft) {
        // Card A is left, Card B is right (e.g. Card 1 -> Card 2)
        startX = aLeft + aWidth - 10;
        startY = aTop + aHeight * 0.45;
        endX = bLeft + 10;
        endY = bTop + bHeight * 0.38;

        const dx = Math.abs(endX - startX);
        cp1X = startX + dx * 0.5;
        cp1Y = startY;
        cp2X = startX + dx * 0.5;
        cp2Y = endY;
      } else {
        // Card A is right, Card B is left (e.g. Card 2 -> Card 3)
        startX = aLeft + 10;
        startY = aTop + aHeight * 0.65;
        endX = bLeft + bWidth - 10;
        endY = bTop + bHeight * 0.45;

        const dx = Math.abs(startX - endX);
        cp1X = startX - dx * 0.5;
        cp1Y = startY;
        cp2X = endX + dx * 0.5;
        cp2Y = endY;
      }

      newPaths.push(
        `M ${Math.round(startX)} ${Math.round(startY)} C ${Math.round(cp1X)} ${Math.round(cp1Y)}, ${Math.round(cp2X)} ${Math.round(cp2Y)}, ${Math.round(endX)} ${Math.round(endY)}`
      );
    }

    if (newPaths.length > 0) {
      setPaths(newPaths);
    }
  }, [data.length, height]);

  React.useEffect(() => {
    updatePaths();

    const handleResize = () => {
      updatePaths();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updatePaths();
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      cardRefs.current.forEach((card) => {
        if (card) resizeObserver?.observe(card);
      });
    }

    const timer = setTimeout(updatePaths, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updatePaths]);

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`w-full bg-white dark:bg-black max-md:pt-10 max-md:pb-16 md:py-16 px-4 sm:px-6 lg:px-10 xl:px-12 relative ${className}`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.15]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        ></div>
        <div
          className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.1]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        ></div>
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>

        <div className="w-full max-w-[1400px] mx-auto relative z-10">
          <div
            ref={containerRef}
            className="relative w-full max-w-[1300px] mx-auto flex flex-col space-y-8 md:space-y-0 md:block h-auto md:h-[var(--md-height)]"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {data.length > 1 && paths.length > 0 && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block z-0"
                viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
              >
                {paths.map((d, index) => (
                  <m.path
                    key={index}
                    d={d}
                    stroke="currentColor"
                    className="text-red-300/80 dark:text-red-800/80"
                    strokeWidth="2.5"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    animate={{
                      strokeDashoffset: -140, // Multiple of 14 (8+6) for seamless loop
                    }}
                    transition={{
                      pathLength: { duration: 1.2, delay: index * 0.35, ease: "easeInOut" },
                      opacity: { duration: 0.5 },
                      strokeDashoffset: {
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  />
                ))}
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={step.title}
                  innerRef={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  index={index}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "blue"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
