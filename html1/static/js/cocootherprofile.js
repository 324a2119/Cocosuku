// --- cocootherprofile.js (修正版) ---

// データ取得（localStorage 等）
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let follows = JSON.parse(localStorage.getItem("follows") || "{}");
let myProfile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

// URL から表示対象ユーザーを取得
const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("user");

// 簡易モック（実運用では API などから取得してください）
const mockProfiles = {
  "そら": {
    name:"そら",
    bio:"趣味は写真、サークルはテニスです。",
    avatar:"そ",
    details:{
      hobby:"読書、写真",
      circle:"テニスサークル",
      dept:"情報システム学科",
      year:"1年",
      license:"基本情報技術者試験 合格",
      comment:"よろしくお願いします！"
    }
  },
  "たけっちょ": {
    name:"たけっちょ",
    bio:"勉強頑張ってます！",
    avatar:"た",
    details:{
      hobby:"プログラミング、ゲーム",
      circle:"勉強サークル",
      dept:"情報デザイン学科",
      year:"2年",
      license:"未取得",
      comment:"日々成長中！"
    }
  }
};

// userProfile を決定（mock がなければ簡易表示）
const userProfile = mockProfiles[userName] || {
  name: userName || "不明なユーザー",
  bio: "",
  avatar: "？",
  details: {
    hobby: "未設定",
    circle: "未設定",
    dept: "未設定",
    year: "未設定",
    license: "未設定",
    comment: ""
  }
};

// DOM 完全読み込みを待ってから実行（より安全）
document.addEventListener("DOMContentLoaded", () => {
  try {
    initProfile();
  } catch (err) {
    console.error("initProfile エラー:", err);
    // エラーで死んだら最低限ユーザー名だけは出す
    const nameEl = document.getElementById("profileName");
    if (nameEl) nameEl.textContent = userProfile.name || "不明なユーザー";
  }
});

// 初期化処理
function initProfile(){
  // セレクタが存在するか確認
  const iconEl = document.getElementById("profileIcon");
  const nameEl = document.getElementById("profileName");
  const headerName = document.getElementById("userNameHeader");
  const bioEl = document.getElementById("profileBio");
  const detailsArea = document.getElementById("detailsArea");

  console.log("initProfile:", userProfile);

  if(iconEl) { iconEl.textContent = userProfile.avatar || "？"; iconEl.style.display="flex"; }
  if(nameEl) { nameEl.textContent = userProfile.name || "不明なユーザー"; nameEl.style.display="block"; }
  if(headerName) headerName.textContent = userProfile.name || "不明なユーザー";
  if(bioEl) { bioEl.textContent = userProfile.bio || ""; bioEl.style.display = (userProfile.bio ? "block" : "none"); }

  // detailsArea が見えない CSS にされている場合に備え、明示的に表示に戻す
  if(detailsArea){
    detailsArea.style.display = "block";
    detailsArea.style.visibility = "visible";
  } else {
    console.warn("detailsArea 要素が見つかりません。HTML 内に id='detailsArea' があるか確認してください。");
  }

  renderDetails(userProfile.details);
  updateFollowBtn();
  updateStats();
  renderUserPosts();
}

// 詳細情報レンダリング（堅牢化）
// details がオブジェクトでない場合は key/value を推測して表示
function renderDetails(details){
  const area = document.getElementById("detailsArea");
  if(!area){
    console.error("renderDetails: detailsArea が見つかりません");
    return;
  }
  area.innerHTML = "";

  // details が存在しない or 非オブジェクトなら安全なデフォルトに置き換え
  if(!details || typeof details !== "object"){
    details = { info: String(details || "未設定") };
  }

  // 表示したい順序があるならここで指定（無ければ Object.keys の順に）
  const preferredOrder = ["hobby","circle","dept","year","license","comment","info"];
  const keys = Array.from(new Set([...preferredOrder.filter(k=>k in details), ...Object.keys(details)]));

  // ヒューマン可読なラベルマップ（必要なら追加）
  const labelMap = {
    hobby: "趣味",
    circle: "サークル/部活",
    dept: "学部/学科/専攻",
    year: "学年",
    license: "資格",
    comment: "一言コメント",
    info: "詳細"
  };

  keys.forEach(key=>{
    const rawVal = details[key];
    const val = (rawVal === undefined || rawVal === null || String(rawVal).trim()==="") ? "未設定" : String(rawVal);
    const row = document.createElement("div");
    row.className = "detail-row";

    const keyDiv = document.createElement("div");
    keyDiv.className = "detail-key";
    keyDiv.textContent = labelMap[key] || (key[0].toUpperCase() + key.slice(1));

    const valDiv = document.createElement("div");
    valDiv.className = "detail-value";
    valDiv.textContent = val;

    row.appendChild(keyDiv);
    row.appendChild(valDiv);
    area.appendChild(row);
  });

  console.log("renderDetails: 表示項目数=", keys.length);
}

// フォロー表示更新
function updateFollowBtn(){
  try{
    if(!myProfile || !myProfile.name) {
      console.warn("updateFollowBtn: myProfile が未定義です");
      return;
    }
    const isFollowing = Array.isArray(follows[myProfile.name]) && follows[myProfile.name].includes(userProfile.name);
    const btn = document.getElementById("followBtn");
    if(!btn) return;
    if(isFollowing){
      btn.textContent = "フォロー中";
      btn.classList.add("following");
    } else {
      btn.textContent = "フォロー";
      btn.classList.remove("following");
    }
  } catch(e){
    console.error("updateFollowBtn エラー:", e);
  }
}

// フォロー切替
function toggleFollow(){
  if(!myProfile || !myProfile.name){
    alert("ログイン情報が見つかりません。");
    return;
  }
  if(!follows[myProfile.name]) follows[myProfile.name] = [];
  const idx = follows[myProfile.name].indexOf(userProfile.name);
  if(idx >= 0) follows[myProfile.name].splice(idx,1);
  else follows[myProfile.name].push(userProfile.name);
  localStorage.setItem("follows", JSON.stringify(follows));
  updateFollowBtn();
  updateStats();
}

// DM 開始
function startChat(){ window.location.href = `cocochat.html?target=${encodeURIComponent(userProfile.name)}`; }

// 統計更新
function updateStats(){
  if(!follows[userProfile.name]) follows[userProfile.name] = [];
  const followingCountEl = document.getElementById("followingCount");
  const followerCountEl = document.getElementById("followerCount");
  const postCountEl = document.getElementById("postCount");
  if(followingCountEl) followingCountEl.textContent = follows[userProfile.name].length;
  let c = 0;
  for(const k in follows){ if(Array.isArray(follows[k]) && follows[k].includes(userProfile.name)) c++; }
  if(followerCountEl) followerCountEl.textContent = c;
  if(postCountEl) postCountEl.textContent = posts.filter(p=>p.name===userProfile.name).length;
}

// 投稿レンダリング（既存ロジック）
function renderUserPosts(){
  const div = document.getElementById("userPostsDiv");
  if(!div) return;
  const userPosts = posts.filter(p => p.name === userProfile.name);
  div.innerHTML = "";
  if(userPosts.length === 0){
    div.innerHTML = "<div style='color:var(--muted);text-align:center;margin-top:20px;'>まだ投稿がありません。</div>";
    return;
  }
  userPosts.slice().reverse().forEach((p,i) => {
    const card = document.createElement("div");
    card.className = "post-card";
    const time = p.time ? new Date(p.time).toLocaleString("ja-JP",{hour12:false}) : "";
    const liked = p.liked ? "liked" : "";
    const img = p.image ? `<img src='${p.image}' class='post-image'>` : "";
    card.innerHTML = `
      <div class='post-header'>
        <div class='icon'>${p.avatar || "？"}</div>
        <div><div class='user-name'>${p.name}</div><div class='time'>${time}</div></div>
      </div>
      <div class='post-content'>${(p.text||"").replace(/\n/g,"<br>")}</div>
      ${img}
      <div class='post-footer'>
        <button class='like-btn ${liked}' onclick='toggleLike(${i})'>❤️</button>
        <span>${p.likes||0}</span>
      </div>`;
    div.appendChild(card);
  });
}

// いいね切替
function toggleLike(i){
  const userPosts = posts.filter(p => p.name === userProfile.name);
  const target = userPosts[userPosts.length - 1 - i];
  const idx = posts.findIndex(p => p === target);
  if(idx !== -1){
    posts[idx].liked = !posts[idx].liked;
    posts[idx].likes = (posts[idx].likes || 0) + (posts[idx].liked ? 1 : -1);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderUserPosts();
  }
}

// フォローモーダル
function openFollowModal(type){
  const modal = document.getElementById("followModal");
  const list = document.getElementById("followList");
  const title = document.getElementById("modalTitle");
  if(!modal || !list || !title) return;
  list.innerHTML = "";
  let users = [];
  if(type === "following"){
    title.textContent = "フォロー中のユーザー";
    users = follows[userProfile.name] || [];
  } else {
    title.textContent = "フォロワー";
    for(const k in follows){ if(Array.isArray(follows[k]) && follows[k].includes(userProfile.name)) users.push(k); }
  }
  if(users.length === 0){
    list.innerHTML = "<p style='text-align:center;color:var(--muted);margin:8px 0;'>ユーザーはいません。</p>";
  } else {
    users.forEach(u => {
      const div = document.createElement("div");
      div.className = "modal-user";
      div.innerHTML = `<div class='modal-avatar' onclick="goOtherProfile('${u}')">${u[0]}</div><div style='flex:1;cursor:pointer;' onclick="goOtherProfile('${u}')">${u}</div>`;
      list.appendChild(div);
    });
  }
  modal.style.display = "flex";
}
function closeFollowModal(){ const modal = document.getElementById("followModal"); if(modal) modal.style.display = "none"; }
function goOtherProfile(u){ closeFollowModal(); if(u !== userProfile.name) window.location.href = `cocootherprofile.html?user=${encodeURIComponent(u)}`; }
function goTimeline(){ window.location.href = "cocotimeline.html"; }
