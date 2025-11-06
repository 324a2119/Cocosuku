// URLパラメータからユーザー名を取得
const params = new URLSearchParams(window.location.search);
const user = params.get("user");

// ユーザーデータ一覧
const users = {
  "そら": {
    icon: "https://i.imgur.com/DPvmY2S.png",
    name: "そら",
    hobby: "読書、旅行",
    club: "写真サークル",
    department: "情報システム学科",
    grade: "2年",
    qualification: "基本情報技術者試験 合格",
    posts: [
      { text: "HTMLとCSSの勉強を頑張っています！", date: "2025-11-03" },
      { text: "文化祭でポスター制作を担当しました！", date: "2025-10-21" },
      { text: "最近はPythonでWebアプリを作ってみました！", date: "2025-09-18" }
    ]
  },
  "なぎ": {
    icon: "https://i.imgur.com/2nCt3Sbl.png",
    name: "なぎ",
    hobby: "映画鑑賞、デザイン",
    club: "美術部",
    department: "情報デザイン学科",
    grade: "1年",
    qualification: "ITパスポート",
    posts: [
      { text: "新しいイラストの練習中！", date: "2025-11-01" },
      { text: "授業でPhotoshopの機能を学びました！", date: "2025-10-25" }
    ]
  },
  "みさき": {
    icon: "https://i.imgur.com/7k1wzUp.png",
    name: "みさき",
    hobby: "料理、カフェ巡り",
    club: "軽音楽部",
    department: "Webクリエイティブ学科",
    grade: "2年",
    qualification: "MOS Excel",
    posts: [
      { text: "友達とライブイベントに行ってきました🎸", date: "2025-10-28" },
      { text: "カフェの新メニューを紹介するサイトを作りました☕", date: "2025-09-30" }
    ]
  }
};

// ユーザー情報を反映
if (user && users[user]) {
  const u = users[user];
  document.getElementById("userIcon").src = u.icon;
  document.getElementById("userName").textContent = u.name;
  document.getElementById("hobby").textContent = u.hobby;
  document.getElementById("club").textContent = u.club;
  document.getElementById("department").textContent = u.department;
  document.getElementById("grade").textContent = u.grade;
  document.getElementById("qualification").textContent = u.qualification;

  const postList = document.getElementById("postList");
  u.posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-item";
    div.innerHTML = `
      <p>${post.text}</p>
      <p class="post-date">${post.date}</p>
    `;
    postList.appendChild(div);
  });

} else {
  document.getElementById("userName").textContent = "ユーザーが見つかりません";
}
