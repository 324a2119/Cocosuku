// ==========================
// cocoprofile.js
// ==========================

// 🔹 プロフィールをlocalStorageから読み込み
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadPosts();
  updateStats();
});

// --------------------------
// 🏠 タイムラインへ戻る
// --------------------------
function goTimeline() {
  window.location.href = "cocotimeline.html";
}

// --------------------------
// 👤 プロフィールを表示
// --------------------------
function loadProfile() {
  const data = JSON.parse(localStorage.getItem("userProfile")) || {};
  document.getElementById("displayName").textContent = data.name || "ゲストユーザー";
  document.getElementById("displayBio").textContent = data.bio || "自己紹介なし";

  const avatar = document.getElementById("avatarPreview");
  avatar.textContent = (data.name && data.name[0]) || "ゲ";
}

// --------------------------
// ✏️ 編集フォームを開く
// --------------------------
function showEditForm() {
  const data = JSON.parse(localStorage.getItem("userProfile")) || {};
  document.getElementById("nameInput").value = data.name || "";
  document.getElementById("bioInput").value = data.bio || "";
  document.getElementById("hobbyInput").value = data.hobby || "";
  document.getElementById("circleInput").value = data.circle || "";
  document.getElementById("courseInput").value = data.course || "";
  document.getElementById("gradeInput").value = data.grade || "";
  document.getElementById("qualificationInput").value = data.qualification || "";
  document.getElementById("commentInput").value = data.comment || "";

  document.getElementById("profileDisplay").style.display = "none";
  document.getElementById("profileEdit").style.display = "block";
}

// --------------------------
// 💾 プロフィール保存
// --------------------------
function saveProfile() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) {
    alert("名前は必須です。");
    return;
  }

  const profileData = {
    name,
    bio: document.getElementById("bioInput").value.trim(),
    hobby: document.getElementById("hobbyInput").value.trim(),
    circle: document.getElementById("circleInput").value.trim(),
    course: document.getElementById("courseInput").value.trim(),
    grade: document.getElementById("gradeInput").value.trim(),
    qualification: document.getElementById("qualificationInput").value.trim(),
    comment: document.getElementById("commentInput").value.trim()
  };

  localStorage.setItem("userProfile", JSON.stringify(profileData));
  alert("プロフィールを保存しました。");
  cancelEdit();
  loadProfile();
}

// --------------------------
// ❌ 編集キャンセル
// --------------------------
function cancelEdit() {
  document.getElementById("profileEdit").style.display = "none";
  document.getElementById("profileDisplay").style.display = "block";
}

// --------------------------
// 📄 投稿の読み込み
// --------------------------
function loadPosts() {
  const posts = JSON.parse(localStorage.getItem("myPosts")) || [];
  const postContainer = document.getElementById("myPosts");
  postContainer.innerHTML = "<h3>自分の投稿</h3>";

  if (posts.length === 0) {
    postContainer.innerHTML += "<p style='text-align:center;color:var(--muted);'>投稿はまだありません。</p>";
    return;
  }

  posts.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
      <p>${p.content}</p>
      <button class="delete-btn" onclick="deletePost(${i})">削除</button>
    `;
    postContainer.appendChild(card);
  });
}

// --------------------------
// 🗑 投稿削除
// --------------------------
function deletePost(index) {
  if (!confirm("この投稿を削除しますか？")) return;
  let posts = JSON.parse(localStorage.getItem("myPosts")) || [];
  posts.splice(index, 1);
  localStorage.setItem("myPosts", JSON.stringify(posts));
  loadPosts();
  updateStats();
}

// --------------------------
// 📊 フォロー・投稿数の更新
// --------------------------
function updateStats() {
  const followers = JSON.parse(localStorage.getItem("followers")) || [];
  const following = JSON.parse(localStorage.getItem("following")) || [];
  const posts = JSON.parse(localStorage.getItem("myPosts")) || [];

  document.getElementById("followerCount").textContent = followers.length;
  document.getElementById("followingCount").textContent = following.length;
  document.getElementById("postCount").textContent = posts.length;
}

// --------------------------
// 👥 フォロー一覧モーダル
// --------------------------
document.getElementById("followerCount").addEventListener("click", () => openFollowModal("followers"));
document.getElementById("followingCount").addEventListener("click", () => openFollowModal("following"));

function openFollowModal(type) {
  const modal = document.getElementById("followModal");
  const list = document.getElementById("followList");
  const title = document.getElementById("modalTitle");

  title.textContent = type === "followers" ? "フォロワー一覧" : "フォロー中のユーザー";
  const data = JSON.parse(localStorage.getItem(type)) || [];

  list.innerHTML = data.length === 0
    ? "<p style='text-align:center;color:var(--muted);'>データがありません。</p>"
    : data.map(u => `
        <div class="modal-user">
          <div class="modal-avatar">${u[0]}</div>
          <div>${u}</div>
        </div>
      `).join("");

  modal.style.display = "flex";
}

// --------------------------
// 🚪 モーダルを閉じる
// --------------------------
function closeFollowModal() {
  document.getElementById("followModal").style.display = "none";
}
