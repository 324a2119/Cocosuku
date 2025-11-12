let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');
if(!localStorage.getItem("isLoggedIn")) window.location.href = "cocologin.html";

// ページ遷移
function goTimeline(){ window.location.href="cocotimeline.html"; }
function goProfile(userName){
    if(userName===profile.name) window.location.href="cocoprofile.html";
    else window.location.href="cocootherprofile.html?user="+encodeURIComponent(userName);
}

// 投稿描画
function renderPosts(){
    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    if(posts.length===0){
        feed.innerHTML='<div style="text-align:center;color:var(--muted);margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
        return;
    }

    posts.slice().reverse().forEach((p,index)=>{
        const card=document.createElement("div");
        card.className="post-card animate-post";
        card.style.opacity=0;
        const time=new Date(p.time).toLocaleString("ja-JP",{hour12:false});
        const liked = p.likesBy?.includes(profile.name)?"liked":"";
        const likeNames = p.likesBy?.join(", ")||"";

        let deleteBtn="";
        if(p.name===profile.name){
            const i=posts.length-1-index;
            deleteBtn=`<button class="delete-btn" onclick="deletePost(${i})">削除</button>`;
        }

        const imageTag = p.image?`<img src="${p.image}" class="post-image">`:"";

        // リプライ常時表示
        let repliesHtml="";
        if(p.replies && p.replies.length>0){
            repliesHtml='<div class="reply-list">';
            p.replies.forEach(r=>{
                repliesHtml+=`<div class="reply-card animate-reply"><span class="reply-name">${r.name}:</span>${r.text}</div>`;
            });
            repliesHtml+='</div>';
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
                <button class="like-btn ${liked}" title="${likeNames||'まだいいねはありません'}" onclick="toggleLike(${index})">❤️</button>
                <span>${p.likesBy?.length||0}</span>
                <button class="reply-btn" onclick="openReplyModal(${index})">💬 リプライ</button>
            </div>
            ${repliesHtml}
        `;
        feed.appendChild(card);
        // 投稿フェードイン
        setTimeout(()=>card.style.opacity=1,50);
    });
}
renderPosts();

// いいね
function toggleLike(index){
    const i=posts.length-1-index;
    if(!posts[i].likesBy) posts[i].likesBy=[];
    if(posts[i].likesBy.includes(profile.name)){
        posts[i].likesBy=posts[i].likesBy.filter(n=>n!==profile.name);
    }else{
        posts[i].likesBy.push(profile.name);
    }
    localStorage.setItem("posts",JSON.stringify(posts));
    renderPosts();
}

// 投稿削除
function deletePost(i){
    const card=document.querySelectorAll(".post-card")[posts.length-1-i];
    card.classList.add("delete-anim");
    setTimeout(()=>{
        posts.splice(i,1);
        localStorage.setItem("posts",JSON.stringify(posts));
        renderPosts();
    },300);
}

// 投稿モーダル
const modalBg=document.getElementById("modalBg");
function openModal(){ modalBg.style.display="flex"; setTimeout(()=>modalBg.classList.add("show"),10); }
function closeModal(){
    modalBg.classList.remove("show");
    setTimeout(()=>{
        modalBg.style.display="none";
        document.getElementById("postText").value="";
        document.getElementById("postImage").value="";
        const preview=document.getElementById("postImagePreview");
        preview.style.display="none";
        preview.src="";
    },300);
}

// 画像プレビュー
function previewImage(event){
    const file=event.target.files[0];
    if(!file) return;
    const preview=document.getElementById("postImagePreview");
    const reader=new FileReader();
    reader.onload=e=>{ preview.src=e.target.result; preview.style.display="block"; };
    reader.readAsDataURL(file);
}

// 投稿追加
async function addPost(){
    const text=document.getElementById("postText").value.trim();
    const file=document.getElementById("postImage").files[0];
    if(!text && !file){ alert("投稿内容または画像を入力してください。"); return; }

    let imageData="";
    if(file){
        imageData=await new Promise((res,rej)=>{
            const reader=new FileReader();
            reader.onloadend=e=>res(e.target.result);
            reader.onerror=()=>rej();
            reader.readAsDataURL(file);
        }).catch(()=>alert("画像の読み込みに失敗しました。"));
    }

    const newPost={ name:profile.name, avatar:profile.avatar, text, image:imageData, time:new Date().toISOString(), likesBy:[], replies:[] };
    posts.push(newPost);
    localStorage.setItem("posts",JSON.stringify(posts));
    closeModal();
    renderPosts();
}

// リプライモーダル
function openReplyModal(index){
    const i=posts.length-1-index;
    const replyModal=document.createElement("div");
    replyModal.className="reply-modal animate";

    const inputId="replyInput"+Date.now();

    replyModal.innerHTML=`
        <div class="reply-modal-content animate-content">
            <h3>リプライ</h3>
            <textarea id="${inputId}" placeholder="リプライを入力"></textarea>
            <div class="reply-buttons">
                <button onclick="addReply(${index}, '${inputId}', this)">送信</button>
                <button onclick="closeReplyModal(this)">閉じる</button>
            </div>
        </div>
    `;
    document.body.appendChild(replyModal);
    setTimeout(()=>replyModal.classList.add("show"),10);
}

function addReply(index,inputId,btn){
    const text=document.getElementById(inputId).value.trim();
    if(!text) return;
    const i=posts.length-1-index;
    if(!posts[i].replies) posts[i].replies=[];
    posts[i].replies.push({name:profile.name,text});
    localStorage.setItem("posts",JSON.stringify(posts));
    renderPosts();
    closeReplyModal(btn);
}

function closeReplyModal(btn){
    const modal=btn.closest(".reply-modal");
    modal.classList.remove("show");
    setTimeout(()=>modal.remove(),300);
}
