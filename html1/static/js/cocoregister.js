document.getElementById("registerBtn").addEventListener("click", register);

function register(){
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(name && email && password){
    localStorage.setItem("isLoggedIn", "true");
    const initialProfile = {
        name: name,
        bio: "新規登録しました！",
        hobby: "",
        circle: "",
        course: "",
        qualification: "",
        grade: "",
        comment: "",
        avatar: name[0] || "名"
    };
    localStorage.setItem("profile", JSON.stringify(initialProfile));
    
    alert("登録が完了しました！");
    window.location.href = "cocotimeline.html";
  } else {
    alert("全ての項目を入力してください。");
  }
}
