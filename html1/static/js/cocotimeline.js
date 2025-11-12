// ==========================
// iPhone16対応・いいね＆リプライ版
// ==========================

let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

if(!localStorage.getItem("isLoggedIn")) window.location.href = "cocologin.html";

function goTimeline(){ window.location.href = "cocotimeline.html"; }
function goProfile(userName){ 
    if(userName===profile.name) window.location.href="cocoprofile.html"; 
    else window.location.href="cocootherprofile.html?user="+encodeURIComponent(userName);
}

function renderPosts(){
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    if(posts.length===0){
        feed.innerHTML='<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
        return;
    }

    posts.slice().reverse().forEach((p,index)=>{
        const card=document.createElement("div"); card.className="post-card";
        const time=new Date(p.time).toLocaleString("ja-JP",{hour12:false});
        const liked = p.likesBy?.includes(profile.name)?"liked":"";
        const likeNames = p.likesBy?.join(", ") || "";
        let deleteBtn = ""; if(p.name===profile.name){ const i = posts.length-1-index; deleteBtn=`<button class="delete-btn" onclick="deletePost(${i})">削除</button>`; }
        let imageTag = p.image?`<img src="${p.image}" class="post-image">`:"";

        let repliesHTML = "";
        if(p.replies && p.replies.length){
            repliesHTML=`<div class="replies">`;
            p.replies.forEach(r=>{
                repliesHTML+=`<div class="reply-card"><span class="reply-name">${r.name}:</span>${r.text}</div>`;
            });
            repliesHTML+=`</div>`;
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
            <div class="post-content">${p.text.replace(/\n/g,"<br>")}</div>
            ${imageTag}
            <div class="post-footer">
                <button class="like-btn ${liked}" onclick="toggleLike(${index})">❤️</button>
                <span title="${likeNames}">${p.likesBy?.length||0}</span>
                <button class="reply-btn" onclick="openReply(${index})">💬 リプライ</button>
            </div>
            ${repliesHTML}
        `;
        feed.appendChild(card);
    });
}
renderPosts();

function toggleLike(index){
    const i = posts.length-1-index;
    if(!posts[i].likesBy) posts[i].likesBy=[];
    if(posts[i].likesBy.includes(profile.name)) posts[i].likesBy = posts[i].likesBy.filter(n=>n!==profile.name);
    else posts[i].likesBy.push(profile.name);
    localStorage.setItem("posts",JSON.stringify(posts));
    renderPosts();
}

function deletePost(i){ if(confirm("本当に削除しますか？")){ posts.splice(i,1); localStorage.setItem("posts",JSON.stringify(posts)); renderPosts(); } }

const modalBg=document.getElementById("modalBg");
function openModal(){ modalBg.style.display="flex"; }
function closeModal(){ modalBg.style.display="none"; document.getElementById("postText").value=""; document.getElementById("postImage").value=""; const p=document.getElementById("postImagePreview"); p.style.display="none"; p.src=""; }

function previewImage(event){
    const file = event.target.files[0]; if(!file) return;
    const preview = document.getElementById("postImagePreview");
    const reader = new FileReader();
    reader.onload = e=>{ preview.src = e.target.result; preview.style.display="block"; };
    setTimeout(()=>reader.readAsDataURL(file),50);
}

async function addPost(){
    const text=document.getElementById("postText").value.trim();
    const file=document.getElementById("postImage").files[0];
    if(!text && !file){ alert("投稿内容または画像を入力してください。"); return; }

    let imageData="";
    if(file){
        imageData = await new Promise((res,rej)=>{
            const reader=new FileReader();
            reader.onloadend=e=>res(e.target.result);
            reader.onerror=()=>rej();
            reader.readAsDataURL(file);
        }).catch(()=>alert("画像読み込み失敗"));
    }

    const newPost = { name:profile.name, avatar:profile.avatar, text, image:imageData, time:new Date().toISOString(), likesBy:[], replies:[] };
    posts.push(newPost); localStorage.setItem("posts",JSON.stringify(posts)); closeModal(); renderPosts();
}

function openReply(index){
    const replyText = prompt("リプライを入力してください:");
    if(replyText && replyText.trim()!==""){
        const i=posts.length-1-index; if(!posts[i].replies) posts[i].replies=[];
        posts[i].replies.push({name:profile.name,text:replyText});
        localStorage.setItem("posts",JSON.stringify(posts)); renderPosts();
    }
}
