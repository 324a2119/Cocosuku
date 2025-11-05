document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", login);
});

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {
    localStorage.setItem("isLoggedIn", "true");

    // 初回ログイン時にデフォルトプロフィール作成
    if (!localStorage.getItem("profile")) {
      const initialProfile = {
        name: "ゲストユーザー",
        bio: "初めまして！",
        hobby: "",
        circle: "",
        course: "",
        qualification: "",
        grade: "",
        comment: "",
        avatar: "ゲ"
      };
      localStorage.setItem("profile", JSON.stringify(initialProfile));
    }

    alert("ログインに成功しました！");
    window.location.href = "cocotimeline.html";
  } else {
    alert("メールアドレスとパスワードを入力してください。");
  }
}
