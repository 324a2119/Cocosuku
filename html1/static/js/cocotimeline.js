let posts = JSON.parse(localStorage.getItem("posts")||"[]");
let profile = JSON.parse(localStorage.getItem("profile")||'{"name":"ゲスト","avatar":"ゲ"}');
let currentReplyIndex = null;

if(!localStorage.getItem("isLoggedIn")) window.location.href="cocologin.html";

function goTimeline(){ window.location.href="cocotimeline.html"; }
function goProfile(userName){
  if(userName===profile.name) window.location.href="cocoprofile.html";
  else window.location.href="cocootherprofile.html?user="+encodeURIComponent(userName);
}

function renderPosts(){
  const feed = document.getElementById("feed");
  feed.innerHTML="";
  if(posts.length===0){
    feed.innerHTML='<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
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

    let imageTag = p.image?`<img src="${p.image}" class="post-image">`:"";

    card.innerHTML=`
      <div class="post-header">
        <div class="icon" onclick="goProfile('${p.name}')">${p.avatar}</div>
        <div>
          <div class="user-name" onclick="goProfile('${p.name}')">${p.name}</div>
          <div class="time">${time}</div>
        </div>
        ${deleteBtn}
      </div>
      <div class="post-content">${p.text.replace(/\n/g,"<br>")}</div>
      ${imageTag}
      <div class="post-footer">
        <button class="like-btn ${liked}" onclick="toggleLike(${index})">❤️</button>
        <span title="${getLikeNames(posts.length-1-index)}">${p.likes||0}</span>
        <button class="post-btn" style="width:auto; padding:4px 8px; font-size:13px;" onclick="openReplyModal(${index})">💬 リプライ</button>
      </div>
      <div class="reply-section" id="reply-section-${index}"></div>
    `;

    feed.appendChild(card);
    renderReplies(index);
  });
}

function toggleLike(index){
  const originalIndex=posts.length-1-index;
  posts[originalIndex].liked = !posts[originalIndex].liked;
  posts[originalIndex].likes = (posts[originalIndex].likes||0) + (posts[originalIndex].liked?1:-1);
  if(!posts[originalIndex].likedNames) posts[originalIndex].likedNames=[];
  if(posts[originalIndex].liked) posts[originalIndex].likedNames.push(profile.name);
  else posts[originalIndex].likedNames = posts[originalIndex].likedNames.filter(n=>n!==profile.name);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

function getLikeNames(index){
  const p=posts[index];
  return p.likedNames?p.likedNames.join(", "):"";
}

function deletePost(originalIndex){
  if(confirm("本当にこの投稿を削除しますか？")){
    posts.splice(originalIndex,1);
    localStorage.setItem("posts",JSON.stringify(posts));
    renderPosts();
  }
}

// -------------------- モーダル --------------------
const modalBg=document.getElementById("modalBg");
modalBg.addEventListener("click", e=> { if(e.target===modalBg) closeModal(); });

function openModal(){ modalBg.style.display="flex"; }
function closeModal(){
  modalBg.style.display="none";
  document.getElementById("postText").value="";
  document.getElementById("postImage").value="";
  document.getElementById("postImagePreview").style.display="none";
  document.getElementById("postImagePreview").src="";
}

function previewImage(event){
  const preview=document.getElementById("postImagePreview");
  const file=event.target.files[0];
  if(file){
    const reader=new FileReader();
    reader.onload=e=>{
      preview.src=e.target.result;
      preview.style.display="block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display="none";
    preview.src="";
  }
}

function addPost(){
  const text=document.getElementById("postText").value.trim();
  const imageInput=document.getElementById("postImage");
  if(!text && !imageInput.files[0]) return alert("投稿内容または画像を入力してください。");
  if(imageInput.files[0]){
    const reader=new FileReader();
    reader.onload=e=>{
      pushPost(text,e.target.result);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    pushPost(text,"");
  }
}

function pushPost(text,imageData){
  const newPost={
    name:profile.name,
    avatar:profile.avatar,
    text:text,
    image:imageData,
    time:new Date().toISOString(),
    likes:0,
    liked:false,
    likedNames:[],
    replies:[]
  };
  posts.push(newPost);
  localStorage.setItem("posts",JSON.stringify(posts));
  closeModal();
  renderPosts();
}

// -------------------- リプライ --------------------
const replyModal=document.getElementById("replyModal");
replyModal.addEventListener("click", e=> { if(e.target===replyModal) closeReplyModal(); });

function openReplyModal(index){ currentReplyIndex=index; replyModal.style.display="flex"; }
function closeReplyModal(){ replyModal.style.display="none"; document.getElementById("replyText").value=""; }

function addReply(){
  const text=document.getElementById("replyText").value.trim();
  if(!text) return alert("リプライを入力してください。");
  const post=posts[posts.length-1-currentReplyIndex];
  if(!post.replies) post.replies=[];
  post.replies.push({name:profile.name,text:text});
  localStorage.setItem("posts",JSON.stringify(posts));
  closeReplyModal();
  renderPosts();
}

function renderReplies(index){
  const section=document.getElementById(`reply-section-${index}`);
  section.innerHTML="";
  const post=posts[posts.length-1-index];
  if(post.replies){
    post.replies.forEach((r,ri)=>{
      const div=document.createElement("div");
      div.className="reply-item";
      div.innerHTML=`<strong>${r.name}</strong>: ${r.text.replace(/\n/g,"<br>")}`;
      if(r.name===profile.name){
        const delBtn=document.createElement("button");
        delBtn.className="delete-reply-btn";
        delBtn.innerText="削除";
        delBtn.onclick=()=> deleteReply(index, ri, div);
        div.appendChild(delBtn);
      }
      section.appendChild(div);
      setTimeout(()=>{ div.style.opacity="1"; div.style.transform="translateY(0)"; },50);
    });
  }
}

function deleteReply(postIndex, replyIndex, element){
  element.style.animation="fadeOutHeight 0.3s forwards";
  setTimeout(()=>{
    const post=posts[posts.length-1-postIndex];
    post.replies.splice(replyIndex,1);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  },300);
}

renderPosts();
