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

function updateCharCount(){
  const text = document.getElementById("postText").value;
  document.getElementById("charCount").innerText = `${Math.min(text.length,300)}/300`;
}

function previewImages(event){
  const files = event.target.files;
  const container = document.getElementById("postImagePreviewContainer");
  container.innerHTML = "";
  Array.from(files).forEach(file=>{
    const reader = new FileReader();
    reader.onload = function(e){
      const img = document.createElement("img");
      img.src = e.target.result;
      container.appendChild(img);
    }
    reader.readAsDataURL(file);
  });
}

function openModal(){ document.getElementById("modalBg").style.display="flex"; }
function closeModal(){ 
  const modalBg = document.getElementById("modalBg");
  modalBg.style.display="none"; 
  document.getElementById("postText").value="";
  document.getElementById("postImage").value="";
  document.getElementById("postImagePreviewContainer").innerHTML="";
  updateCharCount();
}

function addPost(){
  const text = document.getElementById("postText").value.trim();
  const imagesInput = document.getElementById("postImage");
  if(!text && imagesInput.files.length===0) return alert("投稿内容または画像を入力してください");
  if(text.length>300) return alert("投稿は300文字までです");

  const newPost = { name: profile.name, avatar: profile.avatar, text, images: [], time: new Date().toISOString(), likes:0, liked:false };

  if(imagesInput.files.length>0){
    let loaded=0;
    Array.from(imagesInput.files).forEach(file=>{
      const reader = new FileReader();
      reader.onload = function(e){
        newPost.images.push(e.target.result);
        loaded++;
        if(loaded===imagesInput.files.length){
          posts.push(newPost);
          localStorage.setItem("posts", JSON.stringify(posts));
          closeModal();
          renderPosts();
        }
      }
      reader.readAsDataURL(file);
    });
  } else {
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    closeModal();
    renderPosts();
  }
}

function toggleLike(index){
  const originalIndex = posts.length - 1 - index;
  posts[originalIndex].liked = !posts[originalIndex].liked;
  posts[originalIndex].likes = (posts[originalIndex].likes||0) + (posts[originalIndex].liked?1:-1);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

function deletePost(originalIndex){
  if(confirm("本当にこの投稿を削除しますか？")){
    posts.splice(originalIndex,1);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  }
}

function renderPosts(){
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  if(posts.length===0){
    feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
    return;
  }

  posts.slice().reverse().forEach((p,index)=>{
    const card = document.createElement("div");
    card.className="post-card";
    const time = new Date(p.time).toLocaleString("ja-JP",{hour12:false});
    const liked = p.liked?"liked":"";
    let deleteBtn="";
    if(p.name===profile.name){
      const originalIndex=posts.length-1-index;
      deleteBtn=`<button class="delete-btn" onclick="deletePost(${originalIndex})">削除</button>`;
    }
    let imagesHtml="";
    if(p.images && p.images.length>0){
      imagesHtml=p.images.map(img=>`<img src="${img}" class="post-image">`).join("");
    }
    card.innerHTML=`
      <div class="post-header">
        <div class="icon" onclick="goProfile('${p.name}')">${p.avatar}</div>
        <div>
          <div class="user-name" onclick="goProfile('${p.name}')">${p.name}</div>
          <div class="time">${time}</div>
        </div>
        ${deleteBtn}
      </div>
      <div class="post-content">${p.text.replace(/\n/g,'<br>')}</div>
      ${imagesHtml}
      <div class="post-footer">
        <button class="like-btn ${liked}" onclick="toggleLike(${index})">❤️</button>
        <span>${p.likes||0}</span>
      </div>
    `;
    feed.appendChild(card);
  });

  feed.scrollTop = feed.scrollHeight;
}

renderPosts();
