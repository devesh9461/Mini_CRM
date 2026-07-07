export default function Loader({ size = 'md' }) {
  return (
    <div className="loader-container">
      <div className={`spinner ${size === 'sm' ? 'spinner--sm' : ''}`} />
    </div>
  );
}
