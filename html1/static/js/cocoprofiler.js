document.addEventListener("DOMContentLoaded", () => {
  // URLパラメータからユーザー名取得
  const params = new URLSearchParams(window.location.search);
  const userNameParam = decodeURIComponent(params.get("user") || "ゲストユーザー");

  console.log("URLパラメータ:", userNameParam); // デバッグ確認用

  // ローカルデータ取得
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const follows = JSON.parse(localStorage.getItem("follows") || "{}");
  const currentProfile = JSON.parse(localStorage.getItem("profile") || "{}");

  let userProfile;

  // 表示対象を判定
  if (userNameParam === currentProfile.name) {
    userProfile = currentProfile;
  } else {
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
        bio: "このユーザーの自己紹介はありません。"
      };
    }
  }

  // DOM反映
  const nameEl = document.getElementById("profileName");
  const iconEl = document.getElementById("profileIcon");
  const bioEl = document.getElementById("profileBio");

  if (nameEl && iconEl && bioEl) {
    nameEl.textContent = userProfile.name;
    iconEl.textContent = userProfile.avatar;
    bioEl.textContent = userProfile.bio;
  } else {
    console.error("⚠️ profile要素が見つかりません");
    return;
  }

  // フォロー／フォロワー更新
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

  // 投稿一覧
  function renderPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    const myPosts = posts.filter(p => p.name === userProfile.name);

    if (myPosts.length === 0) {
      feed.innerHTML = `<div style="text-align:center; color:var(--muted); margin-top:20px;">まだ投稿がありません。</div>`;
      return;
    }

    myPosts.slice().reverse().forEach(p => {
      const card = document.createElement("div");
      card.className = "post-card";
      const time = new Date(p.time).toLocaleString("ja-JP", { hour12: false });
      const imageTag = p.image ? `<img src="${p.image}" class="post-image">` : "";

      card.innerHTML = `
        <div class="post-header">
          <div class="icon">${p.avatar}</div>
          <div>
            <div class="user-name">${p.name}</div>
            <div class="time">${time}</div>
          </div>
        </div>
        <div class="post-content">${p.text.replace(/\n/g, '<br>')}</div>
        ${imageTag}
      `;
      feed.appendChild(card);
    });
  }
  renderPosts();

  // TLへ戻る関数（HTMLのonclickで参照）
  window.goTimeline = function() {
    window.location.href = "cocotimeline.html";
  };
});
