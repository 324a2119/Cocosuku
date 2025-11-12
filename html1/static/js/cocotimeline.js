// ==========================
// cocotimeline.js（iPhone16対応版）
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
function goTimeline(){ 
    window.location.href = "cocotimeline.html"; 
}

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

  if(posts.length === 0) {
    feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
    return;
  }
  
  // 新しい投稿を上に表示
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
// モーダルの開閉
// --------------------------
const modalBg = document.getElementById("modalBg");

function openModal(){ 
  modalBg.style.display = "flex"; 
}

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

    const preview = document.getElementById("postImagePreview");

    const reader = new FileReader();
    reader.onload = function(e){
        preview.src = e.target.result;
        preview.style.display = "block";
    };
    // iPhone16 Safari対策で少し遅延
    setTimeout(()=>reader.readAsDataURL(file), 50);
}

// --------------------------
// 新規投稿追加
// --------------------------
async function addPost(){
    const text = document.getElementById("postText").value.trim();
    const imageInput = document.getElementById("postImage");
    const file = imageInput.files[0];

    if(!text && !file){
        alert("投稿内容または画像を入力してください。");
        return;
    }

    let imageData = "";
    if(file){
        imageData = await new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onloadend = e => resolve(e.target.result);
            reader.onerror = () => reject();
            reader.readAsDataURL(file);
        }).catch(()=>{
            alert("画像の読み込みに失敗しました。");
        });
    }

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
