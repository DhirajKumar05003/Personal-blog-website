'use strict';

// navbar variables
const nav = document.querySelector('.mobile-nav');
const navMenuBtn = document.querySelector('.nav-menu-btn');
const navCloseBtn = document.querySelector('.nav-close-btn');


// navToggle function
const navToggleFunc = function () { nav.classList.toggle('active'); }

navMenuBtn.addEventListener('click', navToggleFunc);
navCloseBtn.addEventListener('click', navToggleFunc);



// theme toggle variables
const themeBtn = document.querySelectorAll('.theme-btn');


for (let i = 0; i < themeBtn.length; i++) {

  themeBtn[i].addEventListener('click', function () {

    // toggle `light-theme` & `dark-theme` class from `body`
    // when clicked `theme-btn`
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');

    for (let i = 0; i < themeBtn.length; i++) {

      // When the `theme-btn` is clicked,
      // it toggles classes between `light` & `dark` for all `theme-btn`.
      themeBtn[i].classList.toggle('light');
      themeBtn[i].classList.toggle('dark');

    }

  })

}

// Blog publishing and fetching logic
const publishForm = document.getElementById('publishForm');
const publishMessage = document.getElementById('publishMessage');
const publishModal = document.getElementById('publishModal');

function renderBlogs(blogs) {
  const blogList = document.getElementById('blogList');
  if (!blogList) return;
  blogList.innerHTML = '';
  blogs.forEach(blog => {
    const div = document.createElement('div');
    div.className = 'blog-card';
    div.style.cursor = 'pointer';
    div.innerHTML = `
      ${blog.image ? `<img src="https://web-production-e7732.up.railway.app/uploads/${blog.image}" alt="${blog.title}" style="max-width:100%;max-height:180px;object-fit:cover;border-radius:8px 8px 0 0;">` : ''}
      <h3 class="h3">${blog.title}</h3>
      <p>${blog.excerpt}</p>
      <span style="color:var(--accent);text-decoration:underline;">Read more</span>
    `;
    div.onclick = () => openBlogDetail(blog.id);
    blogList.appendChild(div);
  });
}

function fetchBlogs() {
  fetch('https://web-production-e7732.up.railway.app/api/blogs')
    .then(res => res.json())
    .then(renderBlogs)
    .catch(() => {
      const blogList = document.getElementById('blogList');
      if (blogList) blogList.innerHTML = '<p>Could not load blogs.</p>';
    });
}

function openBlogDetail(id) {
  fetch(`https://web-production-e7732.up.railway.app/api/blog/${id}`)
    .then(res => res.json())
    .then(blog => {
      const modal = document.getElementById('blogDetailModal');
      const content = document.getElementById('blogDetailContent');
      let html = '';
      if (blog.image) {
        html += `<img src="https://web-production-e7732.up.railway.app/uploads/${blog.image}" alt="${blog.title}" style="max-width:100%;max-height:300px;object-fit:cover;border-radius:8px;">`;
      }
      html += `<h2 class='h2'>${blog.title}</h2>`;
      html += `<p style='white-space:pre-line;'>${blog.content}</p>`;
      content.querySelectorAll(':not(#closeBlogDetailBtn)').forEach(el => el.remove());
      const temp = document.createElement('div');
      temp.innerHTML = html;
      Array.from(temp.childNodes).forEach(node => content.appendChild(node));
      modal.style.display = 'flex';
    });
}

document.getElementById('closeBlogDetailBtn').onclick = function() {
  document.getElementById('blogDetailModal').style.display = 'none';
};

if (publishForm) {
  publishForm.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(publishForm);
    fetch('https://web-production-e7732.up.railway.app/api/publish', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          publishMessage.innerText = 'Blog published!';
          publishForm.reset();
          fetchBlogs();
        } else {
          publishMessage.innerText = data.message || 'Failed to publish.';
        }
      })
      .catch(() => {
        publishMessage.innerText = 'Failed to publish.';
      });
  };
}

// Fetch blogs on page load
document.addEventListener('DOMContentLoaded', fetchBlogs);