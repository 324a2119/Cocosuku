let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let userProfile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲストユーザー","avatar":"ゲ","bio":"初めまして！"}');
let follows = JSON.parse(localStorage.getItem("follows") || "{}");

// ログインチェック
if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "cocologin.html";
}

// プロフィール反映
document.getElementById("profileIcon").textContent = userProfile.avatar;
document.getElementById("profileName").textContent = userProfile.name;
document.getElementById("profileBio").textContent = userProfile.bio;

// TLに戻る関数
function goTimeline() {
    window.location.href = "cocotimeline.html";
}

// フォロー・フォロワー数更新
function updateStats() {
    if (!follows[userProfile.name]) follows[userProfile.name] = [];
    document.getElementById("followingCount").textContent = follows[userProfile.name].length;

    let followerCount = 0;
    for (const key in follows) {
        if (follows[key].includes(userProfile.name)) followerCount++;
    }
    document.getElementById("followerCount").textContent = followerCount;
}
updateStats();

// 投稿一覧の描画
function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    const myPosts = posts.filter(p => p.name === userProfile.name);

    if (myPosts.length === 0) {
        feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:20px;">まだ投稿がありません。</div>';
        return;
    }

    myPosts.slice().reverse().forEach((p, index) => {
        const card = document.createElement("div");
        card.className = "post-card";
        const time = new Date(p.time).toLocaleString("ja-JP", { hour12: false });
        const liked = p.liked ? "liked" : "";

        const originalIndex = posts.findIndex(post =>
            post.name === p.name && post.text === p.text && post.time === p.time
        );

        const deleteBtn = `<button class="delete-btn" onclick="deletePost(${originalIndex})">削除</button>`;
        const imageTag = p.image ? `<img src="${p.image}" class="post-image">` : "";

        card.innerHTML = `
          <div class="post-header">
            <div class="icon">${p.avatar}</div>
            <div>
              <div class="user-name">${p.name}</div>
              <div class="time">${time}</div>
            </div>
            ${deleteBtn}
          </div>
          <div class="post-content">${p.text.replace(/\n/g, '<br>')}</div>
          ${imageTag}
          <div class="post-footer">
            <button class="like-btn ${liked}" onclick="toggleLike(${index})">❤️</button>
            <span>${p.likes || 0}</span>
          </div>
        `;
        feed.appendChild(card);
    });
}
renderPosts();

// いいね機能
function toggleLike(index) {
    const myPosts = posts.filter(p => p.name === userProfile.name);
    const targetPost = myPosts[myPosts.length - 1 - index];
    const originalIndex = posts.findIndex(p => p === targetPost);

    if (originalIndex !== -1) {
        posts[originalIndex].liked = !posts[originalIndex].liked;
        posts[originalIndex].likes = (posts[originalIndex].likes || 0) + (posts[originalIndex].liked ? 1 : -1);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
    }
}

// 投稿削除機能
function deletePost(originalIndex) {
    if (confirm("本当にこの投稿を削除しますか？")) {
        posts.splice(originalIndex, 1);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
    }
}
