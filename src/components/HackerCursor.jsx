export default function HackerCursor({ position, cursorUrl }) {
  if (!position) return null;
  return (
    <div
      className={`hacker-cursor ${position.clicking ? 'clicking' : ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <img src={cursorUrl} alt="Hacker" />
    </div>
  );
}
