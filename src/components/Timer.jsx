export default function Timer({ seconds }) {
  return (
    <div className={`timer ${seconds <= 4 ? 'urgent' : ''}`}>
      {seconds}s
    </div>
  );
}
