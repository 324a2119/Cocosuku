// URLパラメータからユーザー名を取得
const params = new URLSearchParams(window.location.search);
const userName = params.get("user") || "default";

// データベース（ここを後でFirebase連携も可能）
const userData = {
  sora: {
    name: "そら",
    bio: "情報システム学科の2年生です。プログラミングと写真が好き！",
    hobby: "読書、写真",
    circle: "勉強サークル",
    major: "情報システム学科",
    grade: "2年",
    license: "基本情報技術者試験 合格",
    comment: "よろしくお願いします！",
    icon: "images/sora.png"
  },
  nagi: {
    name: "なぎ",
    bio: "デザインとAIに興味があります。Web制作が得意です！",
    hobby: "イラスト、映画鑑賞",
    circle: "デザイン研究会",
    major: "情報デザイン学科",
    grade: "1年",
    license: "AI検定 合格",
    comment: "一緒に学びましょう！",
    icon: "images/nagi.png"
  },
  yui: {
    name: "ゆい",
    bio: "勉強サークル所属。最近はPythonを練習しています。",
    hobby: "音楽、散歩",
    circle: "勉強サークル",
    major: "情報システム学科",
    grade: "2年",
    license: "ITパスポート 合格",
    comment: "気軽に話しかけてください♪",
    icon: "images/yui.png"
  }
};

// 対応するデータを取得（存在しない場合はdefault）
const data = userData[userName] || {
  name: "不明なユーザー",
  bio: "このユーザーの情報はまだ登録されていません。",
  hobby: "---",
  circle: "---",
  major: "---",
  grade: "---",
  license: "---",
  comment: "---",
  icon: "images/default.png"
};

// DOMに反映
document.getElementById("profile-name").textContent = data.name;
document.getElementById("profile-bio").textContent = data.bio;
document.getElementById("hobby").textContent = data.hobby;
document.getElementById("circle").textContent = data.circle;
document.getElementById("major").textContent = data.major;
document.getElementById("grade").textContent = data.grade;
document.getElementById("license").textContent = data.license;
document.getElementById("comment").textContent = data.comment;
document.getElementById("profile-icon").src = data.icon;

// 画像エラー対策
document.getElementById("profile-icon").onerror = () => {
  document.getElementById("profile-icon").src = "images/default.png";
};

// ボタン機能例
document.getElementById("follow-btn").addEventListener("click", () => {
  alert(`${data.name} さんをフォローしました！`);
});

document.getElementById("dm-btn").addEventListener("click", () => {
  alert(`${data.name} さんにDMを送ります。`);
});
