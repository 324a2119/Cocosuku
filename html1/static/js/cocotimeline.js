let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

if(!localStorage.getItem("isLoggedIn")){
    window.location.href = "cocologin.html";
}

function goTimeline(){ window.location.href="cocotimeline.html"; }
function goProfile(userName){
    if(userName === profile.name){
        window.location.href = "cocoprofile.html";
    } else {
        window.location.href = "cocootherprofile.html?user=" + encodeURIComponent(userName);
    }
}

function renderPosts(){
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  if(posts.length === 0) {
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

function toggleLike(index){
  const originalIndex = posts.length - 1 - index;
  posts[originalIndex].liked = !posts[originalIndex].liked;
  posts[originalIndex].likes = (posts[originalIndex].likes || 0) + (posts[originalIndex].liked ? 1 : -1);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

function deletePost(originalIndex){
    if(confirm("本当にこの投稿を削除しますか？")){
        posts.splice(originalIndex, 1);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
    }
}

const modalBg = document.getElementById("modalBg");
function openModal(){ modalBg.style.display="flex"; }
function closeModal(){ 
  modalBg.style.display="none"; 
  document.getElementById("postText").value=""; 
  document.getElementById("postImage").value=""; 
  document.getElementById("postImagePreview").style.display = "none";
  document.getElementById("postImagePreview").src = "";
}

function previewImage(event){
    const preview = document.getElementById("postImagePreview");
    const file = event.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            preview.src = e.target.result;
            preview.style.display = "block";
        }
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
        preview.src = "";
    }
}

function addPost(){
  const text = document.getElementById("postText").value.trim();
  const imageInput = document.getElementById("postImage");
  
  if(!text && !imageInput.files[0]) return alert("投稿内容または画像を入力してください。");

  if(imageInput.files[0]){
    const reader = new FileReader();
    reader.onload = function(e){
      const newPost = {
        name: profile.name,
        avatar: profile.avatar,
        text: text,
        image: e.target.result,
        time: new Date().toISOString(),
        likes: 0,
        liked: false
      };
      posts.push(newPost);
      localStorage.setItem("posts", JSON.stringify(posts));
      closeModal();
      renderPosts();
    }
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    const newPost = {
      name: profile.name,
      avatar: profile.avatar,
      text: text,
      image: "",
      time: new Date().toISOString(),
      likes: 0,
      liked: false
    };
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    closeModal();
    renderPosts();
  }
}
