let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let follows = JSON.parse(localStorage.getItem("follows") || "{}");
let myProfile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

if(!localStorage.getItem("isLoggedIn")) window.location.href="cocologin.html";

const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("user");

const mockProfiles = {
  "そら": {
    name:"そら",
    bio:"趣味は写真、サークルはテニスです。",
    avatar:"そ",
    details:{
      hobby: "読書、写真",
      circle: "テニスサークル",
      dept: "情報システム学科",
      year: "1年",
      license: "基本情報技術者試験 合格",
      comment: "よろしくお願いします！"
    }
  },
  "たけっちょ": {
    name:"たけっちょ",
    bio:"勉強頑張ってます！",
    avatar:"た",
    details:{
      hobby: "プログラミング、ゲーム",
      circle: "勉強サークル",
      dept: "情報デザイン学科",
      year: "2年",
      license: "未取得",
      comment: "日々成長中！"
    }
  },
  "みかん": {
    name:"みかん",
    bio:"文学部所属。読書が趣味。",
    avatar:"み",
    details:{
      hobby: "読書、散歩",
      circle: "文芸部",
      dept: "文学部",
      year: "3年",
      license: "特になし",
      comment: "読書仲間募集中！"
    }
  },
  [myProfile.name]: Object.assign({}, myProfile, { details: myProfile.details || {
    hobby: "未設定",
    circle: "未設定",
    dept: "未設定",
    year: "未設定",
    license: "未設定",
    comment: "未設定"
  }})
};

const userProfile = mockProfiles[userName] || { name: userName || "不明なユーザー", details: {
  hobby: "未設定", circle: "未設定", dept: "未設定", year: "未設定", license: "未設定", comment: ""
} };

// 自分自身なら cocoprofile.html へ
if(userName === myProfile.name){
  window.location.href = "cocoprofile.html";
}

// 表示初期化
function initProfile(){
  // アイコン
  if(userProfile.avatar){
    const icon=document.getElementById("profileIcon");
    icon.textContent=userProfile.avatar;
    icon.style.display="flex";
  }
  // 名前
  if(userProfile.name){
    const nameEl=document.getElementById("profileName");
    nameEl.textContent=userProfile.name;
    nameEl.style.display="block";
    document.getElementById("userNameHeader").textContent=userProfile.name;
  }
  // 自己紹介
  if(userProfile.bio){
    const bioEl=document.getElementById("profileBio");
    bioEl.textContent=userProfile.bio;
    bioEl.style.display="block";
  }
  // アクション/統計表示
  if(userProfile.name){
    document.getElementById("statsBar").style.display="flex";
    document.getElementById("actionBtns").style.display="flex";
  }
  renderDetails(userProfile.details);
  updateFollowBtn();
  updateStats();
  renderUserPosts();
}

// 詳細情報レンダリング（プロフィール内）
function renderDetails(details){
  const area = document.getElementById("detailsArea");
  area.innerHTML = ""; // クリア
  const items = [
    { key: "趣味", id:"hobby", val: details.hobby || "未設定" },
    { key: "サークル/部活", id:"circle", val: details.circle || "未設定" },
    { key: "学部/学科/専攻", id:"dept", val: details.dept || "未設定" },
    { key: "学年", id:"year", val: details.year || "未設定" },
    { key: "資格", id:"license", val: details.license || "未設定" },
    { key: "一言コメント", id:"comment", val: details.comment || "" }
  ];

  items.forEach(it=>{
    const row = document.createElement("div");
    row.className = "detail-row";

    const key = document.createElement("div");
    key.className = "detail-key";
    key.textContent = it.key;

    const container = document.createElement("div");
    container.style.flex = "1";

    const toggle = document.createElement("button");
    toggle.className = "detail-toggle";
    toggle.setAttribute("aria-expanded","false");
    toggle.type = "button";

    const short = document.createElement("div");
    short.className = "detail-value";
    // 短い表示は1行に切って入れる（長い場合は省略）
    short.textContent = it.val.length > 40 ? it.val.slice(0,40) + "…" : it.val;

    const chev = document.createElement("span");
    chev.className = "chev";
    chev.textContent = "›";

    toggle.appendChild(short);
    toggle.appendChild(chev);

    const expand = document.createElement("div");
    expand.className = "detail-expand";
    expand.id = "expand-"+it.id;
    expand.textContent = it.val || "（設定なし）";

    // クリックで展開
    toggle.addEventListener("click", ()=>{
      const opened = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", opened ? "false" : "true");
      if(opened){
        expand.style.display = "none";
      } else {
        expand.style.display = "block";
      }
    });

    container.appendChild(toggle);
    container.appendChild(expand);

    row.appendChild(key);
    row.appendChild(container);
    area.appendChild(row);
  });
}

// フォロー関連（既存）
function updateFollowBtn(){
  const isFollowing = follows[myProfile.name] && follows[myProfile.name].includes(userProfile.name);
  const btn=document.getElementById("followBtn");
  if(isFollowing){
    btn.textContent="フォロー中";
    btn.classList.add("following");
  }else{
    btn.textContent="フォロー";
    btn.classList.remove("following");
  }
}

function toggleFollow(){
  if(!follows[myProfile.name]) follows[myProfile.name]=[];
  const idx = follows[myProfile.name].indexOf(userProfile.name);
  if(idx>=0) follows[myProfile.name].splice(idx,1);
  else follows[myProfile.name].push(userProfile.name);
  localStorage.setItem("follows",JSON.stringify(follows));
  updateFollowBtn();updateStats();
}

function startChat(){
  window.location.href=`cocochat.html?target=${encodeURIComponent(userProfile.name)}`;
}

function updateStats(){
  if(!follows[userProfile.name]) follows[userProfile.name]=[];
  document.getElementById("followingCount").textContent=follows[userProfile.name].length;
  let c=0;
  for(const k in follows){if(follows[k].includes(userProfile.name)) c++;}
  document.getElementById("followerCount").textContent=c;
  document.getElementById("postCount").textContent=posts.filter(p=>p.name===userProfile.name).length;
}

function renderUserPosts(){
  const div=document.getElementById("userPostsDiv");
  const userPosts=posts.filter(p=>p.name===userProfile.name);
  div.innerHTML="";
  if(userPosts.length===0){
    div.innerHTML="<div style='color:var(--muted);text-align:center;margin-top:20px;'>まだ投稿がありません。</div>";
    return;
  }
  userPosts.slice().reverse().forEach((p,i)=>{
    const card=document.createElement("div");
    card.className="post-card";
    const time=new Date(p.time).toLocaleString("ja-JP",{hour12:false});
    const liked=p.liked?"liked":"";
    const img=p.image?`<img src='${p.image}' class='post-image'>`:"";
    card.innerHTML=`
      <div class='post-header'>
        <div class='icon'>${p.avatar}</div>
        <div><div class='user-name'>${p.name}</div><div class='time'>${time}</div></div>
      </div>
      <div class='post-content'>${p.text.replace(/\n/g,"<br>")}</div>
      ${img}
      <div class='post-footer'>
        <button class='like-btn ${liked}' onclick='toggleLike(${i})'>❤️</button>
        <span>${p.likes||0}</span>
      </div>`;
    div.appendChild(card);
  });
}

function toggleLike(i){
  const userPosts=posts.filter(p=>p.name===userProfile.name);
  const target=userPosts[userPosts.length-1-i];
  const original=posts.findIndex(p=>p===target);
  if(original!==-1){
    posts[original].liked=!posts[original].liked;
    posts[original].likes=(posts[original].likes||0)+(posts[original].liked?1:-1);
    localStorage.setItem("posts",JSON.stringify(posts));
    renderUserPosts();
  }
}

// モーダル処理（既存）
function openFollowModal(type){
  const modal=document.getElementById("followModal");
  const list=document.getElementById("followList");
  const title=document.getElementById("modalTitle");
  list.innerHTML="";
  let users=[];
  if(type==="following"){
    title.textContent="フォロー中のユーザー";
    users=follows[userProfile.name]||[];
  }else{
    title.textContent="フォロワー";
    for(const k in follows){
      if(follows[k].includes(userProfile.name)) users.push(k);
    }
  }
  if(users.length===0){
    list.innerHTML="<p style='text-align:center;color:var(--muted);margin:8px 0;'>ユーザーはいません。</p>";
  }else{
    users.forEach(u=>{
      const div=document.createElement("div");
      div.className="modal-user";
      div.innerHTML=`
        <div class='modal-avatar' onclick="goOtherProfile('${u}')">${u[0]}</div>
        <div style='flex:1;cursor:pointer;' onclick="goOtherProfile('${u}')">${u}</div>`;
      list.appendChild(div);
    });
  }
  modal.style.display="flex";
}
function closeFollowModal(){ document.getElementById("followModal").style.display="none"; }
function goOtherProfile(u){ closeFollowModal(); if(u!==userProfile.name) window.location.href=`cocootherprofile.html?user=${encodeURIComponent(u)}`; }
function goTimeline(){ window.location.href="cocotimeline.html"; }

// 初期化呼び出し
initProfile();
