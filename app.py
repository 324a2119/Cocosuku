from flask import Flask, render_template, request, redirect, url_for, session, flash
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from datetime import datetime, timezone, timedelta
import uuid
import cloudinary
import cloudinary.uploader

# ---------------------------
# JST設定
# ---------------------------
JST = timezone(timedelta(hours=9))

# ---------------------------
# Cloudinary 設定
# ---------------------------
cloudinary.config(
    cloud_name="ddrehvfmy",      # ← あなたの Cloud Name
    api_key="698385679694872",   # ← あなたの API Key
    api_secret="cOamHT2edO2Q7b7u_ITCgeRXROI"      # ← あなたが書き換える
)

# ---------------------------
# Firebase 初期化
# ---------------------------
cred = credentials.Certificate("firebase_config.json")

try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ---------------------------
# Flask アプリ設定
# ---------------------------
app = Flask(__name__)
app.secret_key = os.urandom(24)

# ---------------------------
# トップページ
# ---------------------------
@app.route("/")
def index():
    return redirect(url_for("login"))


# ---------------------------
# ログイン画面
# ---------------------------
@app.route("/login")
def login():
    return render_template("cocologin.html")


# ---------------------------
# ログイン処理
# ---------------------------
@app.route("/login", methods=["POST"])
def login_post():
    email = request.form["email"]
    password = request.form["password"]

    try:
        user = auth.get_user_by_email(email)
        user_ref = db.collection("users").document(user.uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            flash("ユーザー情報が見つかりません。")
            return redirect(url_for("login"))

        user_data = user_doc.to_dict()

        if user_data.get("password") == password:
            session["user"] = {
                "uid": user.uid,
                "name": user_data.get("name"),
                "email": email
            }
            return redirect(url_for("timeline"))
        else:
            flash("パスワードが間違っています。")
            return redirect(url_for("login"))

    except Exception as e:
        print("ログインエラー:", e)
        flash("メールアドレスが見つかりません。")
        return redirect(url_for("login"))


# ---------------------------
# 新規登録画面
# ---------------------------
@app.route("/register")
def register():
    return render_template("cocoregister.html")


# ---------------------------
# 新規登録処理
# ---------------------------
@app.route("/register", methods=["POST"])
def register_post():
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]

    try:
        user = auth.create_user(email=email, password=password)

        db.collection("users").document(user.uid).set({
            "name": name,
            "email": email,
            "password": password
        })

        flash("登録が完了しました！ログインしてください。")
        return redirect(url_for("login"))

    except Exception as e:
        print("登録エラー:", e)
        flash("登録に失敗しました。")
        return redirect(url_for("register"))


# ---------------------------
# ログアウト
# ---------------------------
@app.route("/logout")
def logout():
    session.pop("user", None)
    flash("ログアウトしました。")
    return redirect(url_for("login"))


# ---------------------------
# 投稿処理（Cloudinary版）
# ---------------------------
@app.route("/post", methods=["POST"])
def post():
    if "user" not in session:
        flash("ログインが必要です")
        return redirect(url_for("login"))

    user = session["user"]
    content = request.form.get("content")
    image = request.files.get("image")

    if not content and not image:
        flash("投稿内容が空です")
        return redirect(url_for("timeline"))

    image_url = None

    # Cloudinary にアップロード
    if image and image.filename != "":
        try:
            upload_result = cloudinary.uploader.upload(
                image,
                folder="cocosc_posts"  # Cloudinaryのフォルダ名（自由）
            )
            image_url = upload_result.get("secure_url")
        except Exception as e:
            print("Cloudinary 画像アップロードエラー:", e)
            flash("画像のアップロードに失敗しました")
            return redirect(url_for("timeline"))

    # Firestore に投稿保存
    post_data = {
        "user_id": user["uid"],
        "user_name": user["name"],
        "content": content,
        "image_url": image_url,
        "created_at": datetime.now(JST),
        "likes": []
    }

    db.collection("posts").add(post_data)

    flash("投稿しました！")
    return redirect(url_for("timeline"))


# ---------------------------
# タイムライン表示
# ---------------------------
@app.route("/timeline")
def timeline():
    if "user" not in session:
        flash("ログインが必要です。")
        return redirect(url_for("login"))

    user = session["user"]

    posts_ref = db.collection("posts").order_by(
        "created_at", direction=firestore.Query.DESCENDING
    )

    posts = []

    for doc in posts_ref.stream():
        post = doc.to_dict()
        post["id"] = doc.id

        user_id = post.get("user_id")

        # ⭐ 投稿主ユーザー情報を取得（特に avatar_url）
        if user_id:
            user_doc = db.collection("users").document(user_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                post["user_avatar_url"] = user_data.get("avatar_url", None)
                post["user_name"] = user_data.get("name", "無名ユーザー")
            else:
                post["user_avatar_url"] = None
                post["user_name"] = "無名ユーザー"
        else:
            post["user_avatar_url"] = None
            post["user_name"] = "無名ユーザー"

        # ⭐ リプライ取得
        replies_ref = db.collection("posts").document(doc.id) \
            .collection("replies") \
            .order_by("created_at", direction=firestore.Query.ASCENDING)

        replies = []
        for r in replies_ref.stream():
            rep = r.to_dict()
            rep["id"] = r.id
            replies.append(rep)

        post["replies"] = replies
        post["replies_count"] = len(replies)

        posts.append(post)

    return render_template("cocotimeline.html", user=user, posts=posts)



# ---------------------------
# いいね
# ---------------------------
@app.route("/like/<post_id>", methods=["POST"])
def like_post(post_id):
    if "user" not in session:
        return "unauthorized", 403

    uid = session["user"]["uid"]
    user_name = session["user"]["name"]

    post_ref = db.collection("posts").document(post_id)
    like_ref = post_ref.collection("likes").document(uid)

    if like_ref.get().exists:
        # いいね解除
        like_ref.delete()
        post_ref.update({"likes_count": firestore.Increment(-1)})
        return {"liked": False}

    else:
        # いいね追加（通知向けの情報を保存）
        like_ref.set({
            "user_id": uid,
            "user_name": user_name,
            "created_at": datetime.now(JST)
        })
        post_ref.update({"likes_count": firestore.Increment(1)})

        return {"liked": True}



# ---------------------------
# リプライ
# ---------------------------
@app.route("/reply/<post_id>", methods=["POST"])
def reply_post(post_id):
    if "user" not in session:
        return redirect("/login")

    content = request.form.get("reply")
    user = session["user"]

    if not content:
        flash("返信内容が空です。")
        return redirect("/timeline")

    post_ref = db.collection("posts").document(post_id)

    # replyを追加
    post_ref.collection("replies").add({
        "user_id": user["uid"],
        "user_name": user["name"],
        "content": content,
        "created_at": datetime.now(JST),
    })

    # reply数を更新
    post_ref.update({
        "replies_count": firestore.Increment(1)
    })

    flash("返信しました！")
    return redirect("/timeline")



# ---------------------------
# 投稿削除
# ---------------------------
@app.route("/post/delete/<post_id>", methods=["POST"])
def delete_post(post_id):
    if "user" not in session:
        return redirect("/login")

    post_ref = db.collection("posts").document(post_id)
    post_doc = post_ref.get()

    if not post_doc.exists:
        flash("投稿が見つかりません")
        return redirect("/timeline")

    post = post_doc.to_dict()

    # 投稿主チェック
    if post.get("user_id") != session["user"]["uid"]:
        flash("削除権限がありません")
        return redirect("/timeline")

    # Cloudinary の画像削除
    if post.get("image_url"):
        try:
            # URL から public_id だけ抜き出す
            # https://res.cloudinary.com/{cloud}/image/upload/v12345/folder/xxxxx.jpg
            public_id = post["image_url"].split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"cocosc_posts/{public_id}")
        except Exception as e:
            print("Cloudinary削除エラー:", e)

    # リプライ削除
    for reply in post_ref.collection("replies").stream():
        reply.reference.delete()

    # いいね削除
    for like in post_ref.collection("likes").stream():
        like.reference.delete()

    # 投稿削除
    post_ref.delete()

    flash("投稿を削除しました")
    return redirect("/timeline")


# -------------------
# リプライ削除
# -------------------
@app.route("/reply/delete/<post_id>/<reply_id>", methods=["POST"])
def delete_reply(post_id, reply_id):
    if "user" not in session:
        return redirect("/login")

    uid = session["user"]["uid"]

    reply_ref = db.collection("posts").document(post_id).collection("replies").document(reply_id)
    reply_doc = reply_ref.get()

    if not reply_doc.exists:
        flash("返信が見つかりません")
        return redirect("/timeline")

    if reply_doc.to_dict().get("user_id") != uid:
        flash("削除権限がありません")
        return redirect("/timeline")

    # 削除
    reply_ref.delete()

    # 親投稿の件数を減らす
    db.collection("posts").document(post_id).update({
        "replies_count": firestore.Increment(-1)
    })

    flash("リプライを削除しました")
    return redirect("/timeline")


# ---------------------------
# プロフィール画面
# ---------------------------
@app.route("/profile")
def profile():
    if "user" not in session:
        flash("ログインが必要です")
        return redirect(url_for("login"))

    uid = session["user"]["uid"]

    # ユーザーデータ取得
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()

    if not doc.exists:
        flash("ユーザーデータがありません")
        return redirect(url_for("timeline"))

    user_data = doc.to_dict()

    # 空項目補完
    for key in ["bio", "hobby", "circle", "course", "grade", "qualification", "comment", "avatar_url"]:
        user_data.setdefault(key, "")

    # 投稿取得（自分の投稿）
    posts_ref = db.collection("posts").where("user_id", "==", uid).order_by("created_at", direction=firestore.Query.DESCENDING)
    posts_raw = list(posts_ref.stream())

    posts = []
    for p in posts_raw:
        item = p.to_dict()
        item["id"] = p.id

        # 🔽 サブコレクション（リプライ）も取得する
        replies_ref = db.collection("posts").document(p.id).collection("replies")
        replies = []
        for r in replies_ref.stream():
            reply_data = r.to_dict()
            reply_data["id"] = r.id
            replies.append(reply_data)

        # 返信を追加
        item["replies"] = replies
        item["replies_count"] = len(replies)

        posts.append(item)

    return render_template(
        "cocoprofile.html",
        user=user_data,
        posts=posts,
        post_count=len(posts),
        follower_count=0,
        following_count=0
    )


# ---------------------------
# プロフィール更新
# ---------------------------
@app.route("/profile/update", methods=["POST"])
def profile_update():
    if "user" not in session:
        flash("ログインが必要です")
        return redirect(url_for("login"))

    uid = session["user"]["uid"]
    user_ref = db.collection("users").document(uid)

    # フォーム入力データ
    data = {
        "name": request.form.get("name"),
        "bio": request.form.get("bio"),
        "hobby": request.form.get("hobby"),
        "circle": request.form.get("circle"),
        "course": request.form.get("course"),
        "grade": request.form.get("grade"),
        "qualification": request.form.get("qualification"),
        "comment": request.form.get("comment"),
    }

    file = request.files.get("avatar")
    if file and file.filename != "":
        # Cloudinary にアップロード
        upload_result = cloudinary.uploader.upload(
            file,
            folder="avatars",
            public_id=uid,        # uid.jpg になる
            overwrite=True,
            resource_type="image"
        )

        avatar_url = upload_result.get("secure_url")
        data["avatar_url"] = avatar_url

    # Firestore 更新
    user_ref.update(data)

    flash("プロフィールを更新しました！")
    return redirect(url_for("profile"))

# ---------------------------
# 他ユーザープロフィール画面
# ---------------------------
@app.route("/user/<uid>")
def other_profile(uid):
    if "user" not in session:
        flash("ログインが必要です。")
        return redirect(url_for("login"))

    current_user = session["user"]

    # ▼ 対象ユーザー情報を取得
    user_ref = db.collection("users").document(uid).get()
    if not user_ref.exists:
        flash("ユーザーが見つかりません。")
        return redirect(url_for("timeline"))

    user_data = user_ref.to_dict()
    user_data["uid"] = uid

    # ▼ 対象ユーザーの投稿一覧を取得（新しい順）
    posts_ref = db.collection("posts") \
        .where("user_id", "==", uid) \
        .order_by("created_at", direction=firestore.Query.DESCENDING)

    posts = []
    for doc in posts_ref.stream():
        post = doc.to_dict()
        post["id"] = doc.id

        # 投稿者情報（念のため）
        post["user_avatar_url"] = user_data.get("avatar_url")
        post["user_name"] = user_data.get("name", "無名ユーザー")

        # ▼ リプライ取得
        replies_ref = db.collection("posts").document(doc.id) \
            .collection("replies") \
            .order_by("created_at", direction=firestore.Query.ASCENDING)

        replies = []
        for r in replies_ref.stream():
            rep = r.to_dict()
            rep["id"] = r.id
            replies.append(rep)

        post["replies"] = replies
        post["replies_count"] = len(replies)

        posts.append(post)

    # ▼ フォロー・フォロワー（存在しない場合は 0 に）
    following = user_data.get("following", [])
    followers = user_data.get("followers", [])

    return render_template(
        "cocootherprofile.html",
        profile=user_data,
        posts=posts,
        following_count=len(following),
        follower_count=len(followers),
        post_count=len(posts),
        current_user=current_user
    )





# 後で実装
@app.route("/settings")
def settings():
    return render_template("cocosettings.html")

@app.route("/search")
def search():
    return "検索ページ（後で実装）"

@app.route("/notifications")
def notifications():
    return "通知ページ（後で実装）"

@app.route("/dm")
def dm():
    return "DM（後で実装）"

@app.route("/calendar")
def calendar():
    return "予定ページ（後で実装）"


# ---------------------------
# Flask実行
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
