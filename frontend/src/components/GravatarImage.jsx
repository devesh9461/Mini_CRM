import { useState, useEffect } from 'react';
import { getGravatarUrl } from '../utils/gravatar';

export default function GravatarImage({ email, size = 32, className, alt = '', children, ...props }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!email) { setUrl(null); setFailed(false); return; }
    let cancelled = false;
    setFailed(false);
    getGravatarUrl(email, size).then(result => {
      if (!cancelled) setUrl(result);
    });
    return () => { cancelled = true; };
  }, [email, size]);

  if (!email || !url || failed) return <>{children}</>;

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
