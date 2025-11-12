// ==========================
// cocotimeline.js（画像圧縮対応版）
// ==========================

// 投稿データとプロフィールをローカルストレージから取得
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

// ログインしていない場合はログインページへリダイレクト
if(!localStorage.getItem("isLoggedIn")){
    window.location.href = "cocologin.html";
}

// --------------------------
// ページ遷移系
// --------------------------
function goTimeline(){ window.location.href = "cocotimeline.html"; }

function goProfile(userName){
    if(userName === profile.name){
        window.location.href = "cocoprofile.html";
    } else {
        window.location.href = "cocootherprofile.html?user=" + encodeURIComponent(userName);
    }
}

// --------------------------
// 投稿の描画処理
// --------------------------
function renderPosts(){
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  if(posts.length === 0){
    feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
    return;
  }

  posts.slice().reverse().forEach((p,index)=>{
    const card = document.createElement("div");
    card.className = "post-card";
    const time = new Date(p.time).toLocaleString("ja-JP",{hour12:false});
    const liked = p.liked ? "liked" : "";

    let deleteBtn = "";
    if(p.name === profile.name){
      const originalIndex = posts.length - 1 - index;
      deleteBtn = `<button class="delete-btn" onclick="deletePost(${originalIndex})">削除</button>`;
    }

    let imageTag = p.image ? `<img src="${p.image}" class="post-image">` : "";

    card.innerHTML = `
      <div class="post-header">
        <div class="icon" onclick="goProfile('${p.name}')">${p.avatar}</div>
        <div>
          <div class="user-name" onclick="goProfile('${p.name}')">${p.name}</div>
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

// --------------------------
// いいね機能
// --------------------------
function toggleLike(index){
  const originalIndex = posts.length - 1 - index;
  posts[originalIndex].liked = !posts[originalIndex].liked;
  posts[originalIndex].likes = (posts[originalIndex].likes || 0) + (posts[originalIndex].liked ? 1 : -1);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// --------------------------
// 投稿削除
// --------------------------
function deletePost(originalIndex){
  if(confirm("本当にこの投稿を削除しますか？")){
      posts.splice(originalIndex, 1);
      localStorage.setItem("posts", JSON.stringify(posts));
      renderPosts();
  }
}

// --------------------------
// モーダル開閉
// --------------------------
const modalBg = document.getElementById("modalBg");

function openModal(){ modalBg.style.display = "flex"; }

function closeModal(){ 
  modalBg.style.display = "none"; 
  document.getElementById("postText").value = ""; 
  document.getElementById("postImage").value = ""; 
  const preview = document.getElementById("postImagePreview");
  preview.style.display = "none";
  preview.src = "";
}

// --------------------------
// 画像プレビュー
// --------------------------
function previewImage(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(e){
    const preview = document.getElementById("postImagePreview");
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// --------------------------
// 新規投稿追加（画像圧縮対応）
// --------------------------
function addPost(){
  const text = document.getElementById("postText").value.trim();
  const imageInput = document.getElementById("postImage");
  const file = imageInput.files[0];

  if(!text && !file){
    alert("投稿内容または画像を入力してください。");
    return;
  }

  if(file){
    const reader = new FileReader();
    reader.onload = function(e){
      compressImage(e.target.result, 800, 800, function(compressedData){
        savePost(text, compressedData);
      });
    };
    reader.readAsDataURL(file);
  } else {
    savePost(text, "");
  }
}

// --------------------------
// 画像圧縮処理
// --------------------------
function compressImage(base64, maxWidth, maxHeight, callback){
  const img = new Image();
  img.onload = function(){
    let width = img.width;
    let height = img.height;

    // アスペクト比を維持してリサイズ
    if(width > maxWidth || height > maxHeight){
      if(width / height > maxWidth / maxHeight){
        height *= maxWidth / width;
        width = maxWidth;
      } else {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    const compressedData = canvas.toDataURL("image/jpeg", 0.7); // 圧縮率70%
    callback(compressedData);
  };
  img.src = base64;
}

// --------------------------
// 投稿保存処理
// --------------------------
function savePost(text, imageData){
  const newPost = {
    name: profile.name,
    avatar: profile.avatar,
    text: text,
    image: imageData,
    time: new Date().toISOString(),
    likes: 0,
    liked: false
  };
  posts.push(newPost);
  localStorage.setItem("posts", JSON.stringify(posts));
  closeModal();
  renderPosts();
}
