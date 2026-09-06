(() => {
  const panel = document.querySelector('[data-bu-stories-panel]');
  if (!panel) return;

  const escapeText = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const truncate = (text, max = 180) => {
    const clean = String(text || '').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).trim() + '…';
  };

  const renderError = (message) => {
    panel.innerHTML = '<div class="bu-stories-static-fallback"><p class="bu-stories-static-note">' + message + '</p><p class="bu-stories-static-note">You can still read the <a href="/journal/">Journal</a>, explore <a href="/features">Features</a>, or <a href="/?auth=signup">sign up</a> for the full feed.</p></div>';
  };

  const endpoint = 'https://qoqbdiixztolvtcjdnle.supabase.co/functions/v1/make-server-6c9b0e48/posts?sort=trending&limit=12';
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvcWJkaWl4enRvbHZ0Y2pkbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDEwNjcsImV4cCI6MjA3NzAxNzA2N30.MpuwFgrc1rhlhaCG73LQWgjahM3m0uR4cEd7xvnLO6g";

  fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: 'Bearer ' + anonKey,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const posts = (data && data.success && Array.isArray(data.posts)) ? data.posts : [];
      if (!posts.length) {
        renderError('Community highlights are temporarily unavailable.');
        return;
      }
      const cards = posts.slice(0, 9).map((post) => {
        const id = encodeURIComponent(post.id || '');
        const votes = (post.upvotes || 0) - (post.downvotes || 0);
        const replies = post.replyCount || (post.replies && post.replies.length) || 0;
        return (
          '<article class="bu-story-static-card">' +
            '<p class="bu-story-static-meta">Anonymous</p>' +
            '<p class="bu-story-static-body">' + escapeText(truncate(post.content)) + '</p>' +
            '<p class="bu-story-static-stats">' + votes + ' votes · ' + replies + ' replies</p>' +
            '<a class="bu-story-static-link" href="/story/' + id + '">Open in app experience</a>' +
          '</article>'
        );
      }).join('');
      panel.innerHTML =
        '<p class="bu-stories-static-intro">Recent community highlights (sanitized public posts):</p>' +
        '<div class="bu-story-static-grid">' + cards + '</div>';
    })
    .catch(() => {
      renderError('Could not load community highlights right now.');
    });
})();
