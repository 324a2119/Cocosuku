// 投稿データとプロフィール
let posts = JSON.parse(localStorage.getItem("posts") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"ゲスト","avatar":"ゲ"}');

if(!localStorage.getItem("isLoggedIn")){
    window.location.href = "cocologin.html";　
}

// ナビゲーション
function goTimeline(){ window.location.href="cocotimeline.html"; }
function goProfile(userName){
    if(userName === profile.name){
        window.location.href = "cocoprofile.html";
    } else {
        window.location.href = "cocootherprofile.html?user=" + encodeURIComponent(userName);
    }
}

// モーダル
const modalBg = document.getElementById("modalBg");
function openModal(){
    modalBg.style.display = "flex";
    modalBg.classList.add("fade-in");
}
function closeModal(){
    modalBg.classList.remove("fade-in");
    modalBg.classList.add("fade-out");
    setTimeout(()=>{
        modalBg.style.display = "none";
        modalBg.classList.remove("fade-out");
        document.getElementById("postText").value="";
        document.getElementById("postImage").value="";
        document.getElementById("postImagePreview").style.display="none";
        document.getElementById("postImagePreview").src="";
    },300);
}

// 画像プレビュー
function previewImage(event){
    const preview = document.getElementById("postImagePreview");
    const file = event.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e){
            preview.src = e.target.result;
            preview.style.display="block";
        }
        reader.readAsDataURL(file);
    } else {
        preview.style.display="none";
        preview.src="";
    }
}

// 投稿レンダリング
function renderPosts(){
    const feed = document.getElementById("feed");
    feed.innerHTML="";

    if(posts.length===0){
        feed.innerHTML = '<div style="text-align:center; color:var(--muted); margin-top:30px;">投稿がありません。最初の投稿をしてみましょう！</div>';
        return;
    }

    posts.slice().reverse().forEach((p,index)=>{
        const card = document.createElement("div");
        card.className = "post-card";
        card.style.opacity = "0";
        card.style.transform = "translateY(10px)";

        const time = new Date(p.time).toLocaleString("ja-JP",{hour12:false});
        const liked = p.liked ? "liked" : "";

        let deleteBtn = "";
        if(p.name===profile.name){
            const originalIndex = posts.length-1-index;
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
            <div class="post-content">${p.text.replace(/\n/g,'<br>')}</div>
            ${imageTag}
            <div class="post-footer">
                <button class="like-btn ${liked}" onclick="toggleLike(${index})">❤️</button>
                <span>${p.likes||0}</span>
                <button class="reply-btn" onclick="openReplyModal(${index})">💬 リプライ</button>
            </div>
            <div class="reply-section" id="reply-section-${index}"></div>
        `;

        feed.appendChild(card);

        // ふわっとアニメーション
        setTimeout(()=>{
            card.style.opacity="1";
            card.style.transform="translateY(0)";
            card.style.transition="all 0.3s ease";
        },50);

        renderReplies(index);
    });
}

// いいね
function toggleLike(index){
    const originalIndex = posts.length-1-index;
    posts[originalIndex].liked = !posts[originalIndex].liked;
    posts[originalIndex].likes = (posts[originalIndex].likes||0) + (posts[originalIndex].liked?1:-1);
    localStorage.setItem("posts",JSON.stringify(posts));
    renderPosts();
}

// 削除
function deletePost(originalIndex){
    if(confirm("本当にこの投稿を削除しますか？")){
        posts.splice(originalIndex,1);
        localStorage.setItem("posts",JSON.stringify(posts));
        renderPosts();
    }
}

// 投稿追加
function addPost(){
    const text = document.getElementById("postText").value.trim();
    const imageInput = document.getElementById("postImage");

    if(!text && !imageInput.files[0]) return alert("投稿内容または画像を入力してください。");

    if(imageInput.files[0]){
        const reader = new FileReader();
        reader.onload = function(e){
            savePost(text, e.target.result);
        }
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        savePost(text, "");
    }
}

function savePost(text,image){
    const newPost = {
        name: profile.name,
        avatar: profile.avatar,
        text:text,
        image:image,
        time:new Date().toISOString(),
        likes:0,
        liked:false,
        replies:[]
    };
    posts.push(newPost);
    localStorage.setItem("posts",JSON.stringify(posts));
    closeModal();
    renderPosts();
}

// リプライ
function openReplyModal(postIndex){
    const replyText = prompt("リプライを入力してください：");
    if(replyText){
        const originalIndex = posts.length-1-postIndex;
        if(!posts[originalIndex].replies) posts[originalIndex].replies=[];
        posts[originalIndex].replies.push({
            name:profile.name,
            avatar:profile.avatar,
            text:replyText,
            time:new Date().toISOString()
        });
        localStorage.setItem("posts",JSON.stringify(posts));
        renderReplies(postIndex);
    }
}

function renderReplies(index){
    const section = document.getElementById(`reply-section-${index}`);
    section.innerHTML="";
    const post = posts[posts.length-1-index];
    if(post.replies){
        post.replies.forEach(r=>{
            const div = document.createElement("div");
            div.style.padding="6px 10px";
            div.style.marginTop="6px";
            div.style.background="#fff0f5";
            div.style.borderRadius="10px";
            div.style.fontSize="13px";
            div.style.transition="all 0.3s ease";
            div.innerHTML = `<strong>${r.name}</strong>: ${r.text.replace(/\n/g,"<br>")}`;
            section.appendChild(div);

            // ふわっとアニメーション
            setTimeout(()=>{
                div.style.opacity="1";
                div.style.transform="translateY(0)";
            },50);
            div.style.opacity="0";
            div.style.transform="translateY(10px)";
        });
    }
}

// 初回レンダリング
renderPosts();

