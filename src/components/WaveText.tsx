import React from "react";

interface WaveTextProps {
  text: string;
}

export function WaveText({ text }: WaveTextProps) {
  const words = text.split(" ");
  return (
    <span className="wave-text">
      <span className="sr-only">{text}</span>
      <span className="wave-words" aria-hidden="true">
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <span className="wave-window">
              <span className="wave-glyph" data-char={word}>
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}
