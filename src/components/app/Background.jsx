import React from 'react';

const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const Background = ({
  type = 'image',
  url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920',
  blur = 0,
  opacity = 1,
}) => {
  const containerStyle = {
    filter: `blur(${blur}px)`,
    opacity: opacity,
  };

  const ytId = type === 'youtube' && url ? getYouTubeId(url) : null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-black">
      <div className="w-full h-full transition-opacity duration-300" style={containerStyle}>
        {type === 'youtube' && ytId ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&fs=0&autohide=1`}
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.778vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none border-0"
              allow="autoplay; encrypted-media"
              title="YouTube Background"
            />
          </div>
        ) : type === 'video' ? (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : type === 'color' ? (
          <div className="w-full h-full" style={{ backgroundColor: url }} />
        ) : (
          <img
            src={url}
            alt="Background"
            fetchPriority="high"
            decoding="async"
            loading="eager"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};