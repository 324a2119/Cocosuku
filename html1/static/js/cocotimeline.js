document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});

function goTimeline() {
  location.href = "cocotimeline.html";
}

function openModal() {
  document.getElementById("modalBg").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalBg").style.display = "none";
}

function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("postImagePreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
  }
}

function addPost() {
  const text = document.getElementById("postText").value.trim();
  const image = document.getElementById("postImagePreview").src;
  if (!text && (!image || image === window.location.href)) {
    alert("テキストか画像を入力してください。");
    return;
  }

  const post = {
    text,
    image: image && image.startsWith("data:") ? image : null,
    time: new Date().toLocaleString()
  };

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  posts.unshift(post);
  localStorage.setItem("posts", JSON.stringify(posts));

  document.getElementById("postText").value = "";
  document.getElementById("postImage").value = "";
  document.getElementById("postImagePreview").style.display = "none";

  closeModal();
  loadPosts();
}

function loadPosts() {
  const feed = document.getElementById("feed");
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");

  if (posts.length === 0) {
    feed.innerHTML = '<div class="no-posts">投稿がありません。最初の投稿をしてみましょう！</div>';
    return;
  }

  feed.innerHTML = posts.map(post => `
    <div class="post">
      <div class="time">${post.time}</div>
      <div class="text">${post.text}</div>
      ${post.image ? `<img src="${post.image}" alt="投稿画像">` : ""}
    </div>
  `).join("");
}
