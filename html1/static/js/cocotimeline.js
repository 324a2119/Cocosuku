// 投稿データをローカルストレージに保存
let posts = JSON.parse(localStorage.getItem("posts") || "[]");

// 投稿一覧を描画
function renderPosts() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  if (posts.length === 0) {
    feed.innerHTML = "<p>まだ投稿がありません。</p>";
    return;
  }

  posts.slice().reverse().forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "post-card";
    const time = new Date(p.time).toLocaleString("ja-JP", { hour12: false });
    card.innerHTML = `
      <div class="user-name">${p.name}</div>
      <div class="post-text">${p.text.replace(/\n/g, "<br>")}</div>
      ${p.image ? `<img src="${p.image}" style="width:100%;border-radius:10px;margin-top:6px;">` : ""}
      <div class="time" style="color:#888;font-size:12px;">${time}</div>
      <button class="delete-btn" onclick="deletePost(${i})">削除</button>
    `;
    feed.appendChild(card);
  });
}

// 投稿追加
function addPost() {
  const text = document.getElementById("postText").value.trim();
  const file = document.getElementById("postImage").files[0];
  if (!text && !file) return alert("投稿内容を入力してください。");

  const post = {
    name: "そら", // 仮のユーザー名
    text,
    time: new Date().toISOString(),
    image: ""
  };

  const savePost = (img) => {
    post.image = img || "";
    posts.push(post);
    localStorage.setItem("posts", JSON.stringify(posts));
    closeModal();
    renderPosts();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => savePost(e.target.result);
    reader.readAsDataURL(file);
  } else {
    savePost("");
  }
}

function deletePost(i) {
  if (confirm("削除しますか？")) {
    posts.splice(i, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  }
}

// モーダル関連
const modalBg = document.getElementById("modalBg");
const openBtn = document.getElementById("openPostBtn");
const cancelBtn = document.getElementById("cancelPostBtn");
const submitBtn = document.getElementById("submitPostBtn");

function openModal() {
  modalBg.style.display = "flex";
}
function closeModal() {
  modalBg.style.display = "none";
  document.getElementById("postText").value = "";
  document.getElementById("postImage").value = "";
  document.getElementById("postImagePreview").style.display = "none";
}

// イベント登録（スマホ対応）
["click", "touchstart"].forEach(evt => {
  openBtn.addEventListener(evt, openModal);
  cancelBtn.addEventListener(evt, closeModal);
  submitBtn.addEventListener(evt, (e) => {
    e.preventDefault();
    addPost();
  });
});

function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("postImagePreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

renderPosts();
