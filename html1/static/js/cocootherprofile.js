document.addEventListener("DOMContentLoaded", () => {
  // URLパラメータから user を取得
  const params = new URLSearchParams(window.location.search);
  const rawUser = params.get("user");
  const userNameParam = rawUser ? decodeURIComponent(rawUser) : "ゲストユーザー";
  console.log("取得した user 名:", userNameParam);

  // ローカルストレージからデータ取得
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const follows = JSON.parse(localStorage.getItem("follows") || "{}");
  const currentProfile = JSON.parse(localStorage.getItem("profile") || "{}");

  let userProfile;

  // 自分自身のプロフィールかどうか
  if (userNameParam === currentProfile.name) {
    userProfile = currentProfile;
  } else {
    // 他人プロフィール
    const userPosts = posts.filter(p => p.name === userNameParam);
    if (userPosts.length > 0) {
      userProfile = {
        name: userNameParam,
        avatar: userPosts[0].avatar || userNameParam[0],
        bio: "このユーザーの自己紹介はありません。"
      };
    } else {
      userProfile = {
        name: userNameParam,
        avatar: userNameParam[0] || "？",
        bio: "このユーザーの情報はまだありません。"
      };
    }
  }

  // DOM反映
  const iconEl = document.getElementById("profileIcon");
  const nameEl = document.getElementById("profileName");
  const bioEl = document.getElementById("profileBio");

  if (iconEl) iconEl.textContent = userProfile.avatar;
  if (nameEl) nameEl.textContent = userProfile.name;
  if (bioEl) bioEl.textContent = userProfile.bio;

  // フォロー／フォロワー数を更新
  function updateStats() {
    if (!follows[userProfile.name]) follows[userProfile.name] = [];
    const followingCountEl = document.getElementById("followingCount");
    if (followingCountEl) followingCountEl.textContent = follows[userProfile.name].length;

    let followerCount = 0;
    for (const key in follows) {
      if (follows[key].includes(userProfile.name)) {
        followerCount++;
      }
    }
    const followerCountEl = document.getElementById("followerCount");
    if (followerCountEl) followerCountEl.textContent = followerCount;
  }
  updateStats();

  // 投稿一覧を描画
  function renderPosts() {
    const feed = document.getElementById("feed");
    if (!feed) return;
    feed.innerHTML = "";

    const myPosts = posts.filter(p => p.name === userProfile.name);
    if (myPosts.length === 0) {
      feed.innerHTML = `<div style="text-align:center; color:var(--muted); margin-top:20px;">
        まだ投稿がありません。
      </div>`;
      return;
    }

    myPosts.slice().reverse().forEach(p => {
      const card = document.createElement("div");
      card.className = "post-card";
      const time = new Date(p.time).toLocaleString("ja-JP", { hour12: false });
      const imageTag = p.image ? `<img src="${p.image}" class="post-image">` : "";

      card.innerHTML = `
        <div class="post-header">
          <div class="icon">${p.avatar || ""}</div>
          <div>
            <div class="user-name">${p.name}</div>
            <div class="time">${time}</div>
          </div>
        </div>
        <div class="post-content">${(p.text || "").replace(/\n/g, "<br>")}</div>
        ${imageTag}
      `;
      feed.appendChild(card);
    });
  }
  renderPosts();

  // TLへ戻る関数
  window.goTimeline = function() {
    window.location.href = "cocotimeline.html";
  };
});
