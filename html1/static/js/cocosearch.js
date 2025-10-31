// ログインチェック
if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "cocologin.html";
}

// モックデータ（仮ユーザー）
const users = [
  { name: "そら", bio: "趣味は写真、サークルはテニスです。" },
  { name: "たけっちょ", bio: "勉強頑張ってます！" },
  { name: "みかん", bio: "文学部所属。読書が趣味。" },
  { name: "なぎさ", bio: "映画が好きで、よく観ます。" },
  { name: "ゆう", bio: "音楽制作が趣味です。" },
  { name: "さくら", bio: "美術部所属。絵を描くのが好き。" }
];

const searchResults = document.getElementById("searchResults");
const input = document.getElementById("searchInput");

// 検索ボタン（おまけ機能）
function search(){
  if(!input.value.trim()){
    alert("検索ワードを入力してください。");
    return;
  }
  liveSearch();
}

// 入力ごとにリアルタイム検索
function liveSearch(){
  const keyword = input.value.trim().toLowerCase();
  searchResults.innerHTML = "";

  if(keyword === ""){
    searchResults.innerHTML = `<div class="no-results">
      検索ワードを入力してください。
    </div>`;
    return;
  }

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(keyword) || 
    u.bio.toLowerCase().includes(keyword)
  );

  if(filtered.length === 0){
    searchResults.innerHTML = `<div class="no-results">
      該当するユーザーはいません。
    </div>`;
    return;
  }

  filtered.forEach(u => {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.innerHTML = `
      <div class="result-name">${u.name}</div>
      <div class="result-bio">${u.bio}</div>
    `;
    item.onclick = () => {
      window.location.href = `cocootherprofile.html?user=${encodeURIComponent(u.name)}`;
    };
    searchResults.appendChild(item);
  });
}
