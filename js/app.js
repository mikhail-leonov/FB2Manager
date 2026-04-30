document.querySelector('.like-btn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const btn = e.currentTarget;
  const bookId = btn.dataset.bookId;
  const isLiked = btn.dataset.liked === 'true';
  const action = isLiked ? 'unlike' : 'like';
  
  try {
    const response = await fetch(`/like/${action}/${bookId}`);
    const data = await response.json();
    
    if (data.success) {
      if (data.action === 'liked') {
        btn.dataset.liked = 'true';
        btn.innerHTML = '★';
      } else {
        btn.dataset.liked = 'false';
        btn.innerHTML = '☆';
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
