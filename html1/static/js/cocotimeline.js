// ==========================
// cocotimeline.js（iPhone16対応・いいね＆リプライ対応）
// ==========================

let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

if(!localStorage.getItem("isLoggedIn")) window.location.href = "cocologin.html";

const modalBg = document.getElementById("modalBg");

// --------------------------
// ページ遷移
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
// 投稿描画
// --------------------------
function renderPosts(){
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    if(posts.length === 0){
        feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
        return;
    }

    posts.slice().reverse().forEach((p, index) => {
        const card = document.createElement("div");
        card.className = "post-card";

        const time = new Date(p.time).toLocaleString("ja-JP", {hour12:false});
        const liked = p.likesBy?.includes(profile.name) ? "liked" : "";
        const likeNames = p.likesBy?.join(", ") || "";

        let deleteBtn = "";
        if(p.name === profile.name){
            const i = posts.length - 1 - index;
            deleteBtn = `<button class="delete-btn" onclick="deletePost(${i})">削除</button>`;
        }

        const imageTag = p.image ? `<img src="${p.image}" class="post-image">` : "";

        card.innerHTML = `
            <div class="post-header">
                <div class="icon" onclick="goProfile('${p.name}')">${p.avatar}</div>
                <div>
                    <div class="user-name" onclick="goProfile('${p.name}')">${p.name}</div>
                    <div class="time">${time}</div>
                </div>
                ${deleteBtn}
            </div>
            <div class="post-content">${p.text.replace(/\n/g, "<br>")}</div>
            ${imageTag}
            <div class="post-footer">
                <button class="like-btn ${liked}" 
                    title="${likeNames || 'まだいいねはありません'}"
                    onclick="toggleLike(${index})">❤️</button>
                <span>${p.likesBy?.length || 0}</span>
                <button class="reply-btn" onclick="openReplyModal(${index})">💬 リプライ</button>
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
    const i = posts.length - 1 - index;
    if(!posts[i].likesBy) posts[i].likesBy = [];
    if(posts[i].likesBy.includes(profile.name)){
        posts[i].likesBy = posts[i].likesBy.filter(n => n !== profile.name);
    } else {
        posts[i].likesBy.push(profile.name);
    }
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
}

// --------------------------
// 投稿削除
// --------------------------
function deletePost(i){
    if(confirm("本当にこの投稿を削除しますか？")){
        posts.splice(i,1);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
    }
}

// --------------------------
// 投稿モーダル
// --------------------------
function openModal(){ modalBg.style.display = "flex"; }
function closeModal(){
    modalBg.style.display = "none";
    document.getElementById("postText").value="";
    document.getElementById("postImage").value="";
    const preview = document.getElementById("postImagePreview");
    preview.style.display="none";
    preview.src="";
}

// --------------------------
// 画像プレビュー
// --------------------------
function previewImage(event){
    const file = event.target.files[0];
    if(!file) return;

    const preview = document.getElementById("postImagePreview");
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display="block"; };
    setTimeout(()=>reader.readAsDataURL(file), 50);
}

// --------------------------
// 投稿追加
// --------------------------
async function addPost(){
    const text = document.getElementById("postText").value.trim();
    const file = document.getElementById("postImage").files[0];

    if(!text && !file){
        alert("投稿内容または画像を入力してください。");
        return;
    }

    let imageData = "";
    if(file){
        imageData = await new Promise((res,rej)=>{
            const reader = new FileReader();
            reader.onloadend = e => res(e.target.result);
            reader.onerror = () => rej();
            reader.readAsDataURL(file);
        }).catch(()=>alert("画像の読み込みに失敗しました。"));
    }

    const newPost = {
        name: profile.name,
        avatar: profile.avatar,
        text,
        image: imageData,
        time: new Date().toISOString(),
        likesBy: [],
        replies: []
    };

    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    closeModal();
    renderPosts();
}

// --------------------------
// リプライモーダル
// --------------------------
function openReplyModal(index){
    const post = posts[posts.length-1-index];
    const replyModal = document.createElement("div");
    replyModal.className = "reply-modal";
    replyModal.innerHTML = `
        <div class="reply-modal-content">
            <h3>${post.name} の投稿</h3>
            <div class="reply-list" id="replyList"></div>
            <textarea id="replyInput" placeholder="リプライを入力"></textarea>
            <button onclick="addReply(${index}, this)">送信</button>
            <button onclick="closeReplyModal(this)">閉じる</button>
        </div>
    `;
    document.body.appendChild(replyModal);
    renderReplies(index);
}

function renderReplies(index){
    const i = posts.length-1-index;
    const replyList = document.getElementById("replyList");
    replyList.innerHTML = "";
    const replies = posts[i].replies || [];
    replies.forEach(r => {
        const div = document.createElement("div");
        div.className = "reply-card";
        div.innerHTML = `<span class="reply-name">${r.name}:</span> ${r.text}`;
        replyList.appendChild(div);
    });
}

function addReply(index, btn){
    const textarea = document.getElementById("replyInput");
    const text = textarea.value.trim();
    if(!text) return;

    const i = posts.length-1-index;
    if(!posts[i].replies) posts[i].replies = [];
    posts[i].replies.push({name: profile.name, text});
    localStorage.setItem("posts", JSON.stringify(posts));
    textarea.value="";
    renderReplies(index);
    renderPosts();
}

function closeReplyModal(btn){
    btn.closest(".reply-modal").remove();
}
