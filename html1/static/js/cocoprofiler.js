// URLの ?user=〜 から名前を取得
const params = new URLSearchParams(window.location.search);
const userNameParam = params.get("user") || "ゲストユーザー";

// posts と follows は既存
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let follows = JSON.parse(localStorage.getItem("follows") || "{}");

// 他人プロフィール表示用
let userProfile = JSON.parse(localStorage.getItem("profile") || '{}');

// 他のユーザーの場合は、profileをpostsから推測するか、仮データを用意
const userPosts = posts.filter(p => p.name === userNameParam);
if (userNameParam === userProfile.name) {
    // 自分のプロフィール
    userProfile = JSON.parse(localStorage.getItem("profile"));
} else if (userPosts.length > 0) {
    // 投稿から取得
    userProfile = {
        name: userNameParam,
        avatar: userPosts[0].avatar || userNameParam[0],
        bio: "このユーザーの自己紹介はありません。"
    };
} else {
    // 投稿もプロフィールもない場合
    userProfile = {
        name: userNameParam,
        avatar: userNameParam[0] || "ゲ",
        bio: "このユーザーの自己紹介はありません。"
    };
}

// プロフィール反映
document.getElementById("profileIcon").textContent = userProfile.avatar;
document.getElementById("profileName").textContent = userProfile.name;
document.getElementById("profileBio").textContent = userProfile.bio;

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

// 投稿描画関数はそのまま使える
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

        const deleteBtn = `<button class="delete-btn" style="display:none;">削除</button>`; // 他人の投稿は削除不可
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
