document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const rawUser = params.get("user");
  const userNameParam = rawUser ? decodeURIComponent(rawUser) : "ゲストユーザー";

  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  const follows = JSON.parse(localStorage.getItem("follows") || "{}");
  const currentProfile = JSON.parse(localStorage.getItem("profile") || "{}");

  // 詳細プロフィールデータ
  const profiles = JSON.parse(localStorage.getItem("profiles") || "{}");
  const userExtra = profiles[userNameParam] || {};

  const isMyProfile = userNameParam === currentProfile.name;
  let userProfile;

  if (isMyProfile) {
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
        bio: "このユーザーの情報はまだありません。"
      };
    }
  }

  // 基本情報を反映
  document.getElementById("profileIcon").textContent = userProfile.avatar;
  document.getElementById("profileName").textContent = userProfile.name;
  document.getElementById("profileBio").textContent = userProfile.bio;

  // 編集ボタン制御
  const editBtn = document.getElementById("editProfileBtn");
  if (!isMyProfile) {
    editBtn.style.display = "none";
  } else {
    editBtn.addEventListener("click", () => {
      window.location.href = "cocoprofileedit.html";
    });
  }

  // 詳細情報を反映
  document.getElementById("detailHobby").textContent = userExtra.hobby || "未設定";
  document.getElementById("detailClub").textContent = userExtra.club || "未設定";
  document.getElementById("detailDept").textContent = userExtra.department || "未設定";
  document.getElementById("detailGrade").textContent = userExtra.grade || "未設定";
  document.getElementById("detailCert").textContent = userExtra.cert || "未設定";
  document.getElementById("detailComment").textContent = userExtra.comment || "未設定";

  // フォロー・フォロワー数
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
        <div class="post-content">${p.text.replace(/\n/g, "<br>")}</div>
        ${imageTag}
      `;
      feed.appendChild(card);
    });
  }
  renderPosts();

  // TLへ戻る
  window.goTimeline = function() {
    window.location.href = "cocotimeline.html";
  };
});
