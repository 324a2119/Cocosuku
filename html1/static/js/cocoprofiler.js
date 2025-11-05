document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const userNameParam = decodeURIComponent(params.get("user") || "ゲストユーザー");

  console.log("URLパラメータから取得:", userNameParam); // デバッグ確認用

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const follows = JSON.parse(localStorage.getItem("follows") || "{}");
  const currentProfile = JSON.parse(localStorage.getItem("profile") || "{}");

  // 表示対象のプロフィール
  let userProfile;

  if (userNameParam === currentProfile.name) {
    // 自分のプロフィール
    userProfile = currentProfile;
  } else {
    // 他人のプロフィール（投稿がある場合とない場合で分岐）
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

  // DOMに反映
  document.getElementById("profileIcon").textContent = userProfile.avatar;
  document.getElementById("profileName").textContent = userProfile.name;
  document.getElementById("profileBio").textContent = userProfile.bio;

  // フォロー・フォロワー数を更新
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

  // 投稿表示
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

  // TLへ戻る関数（HTMLでonclick参照されてる）
  window.goTimeline = function() {
    window.location.href = "cocotimeline.html";
  };
});
