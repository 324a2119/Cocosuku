// データ取得
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let follows = JSON.parse(localStorage.getItem("follows") || "{}");
let myProfile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get("user");

// 仮プロフィールデータ
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

const userProfile = mockProfiles[userName] || {
  name:userName || "不明なユーザー",
  bio:"",
  avatar:"？",
  details:{
    hobby:"未設定",
    circle:"未設定",
    dept:"未設定",
    year:"未設定",
    license:"未設定",
    comment:""
  }
};

// 初期化
function initProfile(){
  document.getElementById("profileIcon").textContent = userProfile.avatar;
  document.getElementById("profileName").textContent = userProfile.name;
  document.getElementById("userNameHeader").textContent = userProfile.name;
  document.getElementById("profileBio").textContent = userProfile.bio;
  renderDetails(userProfile.details);
  updateFollowBtn();
  updateStats();
  renderUserPosts();
}

// ✅ 詳細情報を常に全項目表示
function renderDetails(details){
  const area = document.getElementById("detailsArea");
  area.innerHTML = "";
  const items = [
    { key:"趣味", val:details.hobby },
    { key:"サークル/部活", val:details.circle },
    { key:"学部/学科/専攻", val:details.dept },
    { key:"学年", val:details.year },
    { key:"資格", val:details.license },
    { key:"一言コメント", val:details.comment }
  ];
  items.forEach(it=>{
    const row = document.createElement("div");
    row.className = "detail-row";
    row.innerHTML = `
      <div class="detail-key">${it.key}</div>
      <div class="detail-value">${it.val || "未設定"}</div>
    `;
    area.appendChild(row);
  });
}

// 既存のフォローや投稿関数は省略せず動作
function updateFollowBtn(){
  const isFollowing = follows[myProfile.name]?.includes(userProfile.name);
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
  const idx=follows[myProfile.name].indexOf(userProfile.name);
  if(idx>=0) follows[myProfile.name].splice(idx,1);
  else follows[myProfile.name].push(userProfile.name);
  localStorage.setItem("follows",JSON.stringify(follows));
  updateFollowBtn();updateStats();
}
function startChat(){window.location.href=`cocochat.html?target=${encodeURIComponent(userProfile.name)}`;}
function updateStats(){
  if(!follows[userProfile.name]) follows[userProfile.name]=[];
  document.getElementById("followingCount").textContent=follows[userProfile.name].length;
  let c=0;for(const k in follows){if(follows[k].includes(userProfile.name))c++;}
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
  const idx=posts.findIndex(p=>p===target);
  if(idx!==-1){
    posts[idx].liked=!posts[idx].liked;
    posts[idx].likes=(posts[idx].likes||0)+(posts[idx].liked?1:-1);
    localStorage.setItem("posts",JSON.stringify(posts));
    renderUserPosts();
  }
}
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
    for(const k in follows){if(follows[k].includes(userProfile.name))users.push(k);}
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
function closeFollowModal(){document.getElementById("followModal").style.display="none";}
function goOtherProfile(u){closeFollowModal();if(u!==userProfile.name)window.location.href=`cocootherprofile.html?user=${encodeURIComponent(u)}`;}
function goTimeline(){window.location.href="cocotimeline.html";}

// 実行
initProfile();
