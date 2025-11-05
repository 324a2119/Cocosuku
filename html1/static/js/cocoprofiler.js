window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const userNameParam = params.get("user") || "ゲストユーザー";

  let posts = JSON.parse(localStorage.getItem("posts") || "[]");
  let follows = JSON.parse(localStorage.getItem("follows") || "{}");
  let userProfile = JSON.parse(localStorage.getItem("profile") || "{}");

  // デフォルトプロフィール生成
  if (!userProfile.name || userProfile.name !== userNameParam) {
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
        avatar: userNameParam[0] || "ゲ",
        bio: "このユーザーの自己紹介はありません。"
      };
    }
  }

  // DOM存在チェック付き更新
  const nameEl = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = userProfile.name;

  const iconEl = document.getElementById("profileIcon");
  if (iconEl) iconEl.textContent = userProfile.avatar;

  const bioEl = document.getElementById("profileBio");
  if (bioEl) bioEl.textContent = userProfile.bio;

  // フォロワー・フォロー数
  const updateStats = () => {
    if (!follows[userProfile.name]) follows[userProfile.name] = [];
    document.getElementById("followingCount").textContent = follows[userProfile.name].length;

    let followerCount = 0;
    for (const key in follows) {
      if (follows[key].includes(userProfile.name)) followerCount++;
    }
    document.getElementById("followerCount").textContent = followerCount;
  };
  updateStats();

  // 投稿描画
  const renderPosts = () => {
    const feed = document.getElementById("feed");
    if (!feed) return;
    feed.innerHTML = "";

    const myPosts = posts.filter(p => p.name === userProfile.name);
    if (myPosts.length === 0) {
      feed.innerHTML = '<div style="text-align:center; color:gray; margin-top:20px;">まだ投稿がありません。</div>';
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
        <div class="post-content">${p.text.replace(/\n/g, "<br>")}</div>
        ${imageTag}
      `;
      feed.appendChild(card);
    });
  };
  renderPosts();
});
