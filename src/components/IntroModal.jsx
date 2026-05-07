/* eslint-disable react/prop-types */

export default function IntroModal({ intro, onAction }) {
  return (
    <div className="end-screen">
      <div className="end-card level-intro">
        <h2>{intro.title}</h2>
        <div className="intro-copy">
          {intro.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {intro.bullets && (
            <ul className="intro-bullets">
              {intro.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {intro.closing?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <button type="button" className="btn" onClick={onAction}>
          {intro.action}
        </button>
      </div>
    </div>
  );
}
