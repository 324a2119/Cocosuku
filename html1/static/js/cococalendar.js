// =============================
// ロール選択モーダル（毎回表示）
// =============================
let userRole = null;

// ページ読み込み時に毎回ロール確認
window.addEventListener("load", () => {
  showRoleModal();
});

function showRoleModal() {
  const modal = document.createElement("div");
  modal.id = "roleModal";
  modal.innerHTML = `
    <div class="role-modal-bg">
      <div class="role-modal">
        <h2>あなたの区分を選んでください</h2>
        <div class="role-buttons">
          <button class="role-btn student">学生</button>
          <button class="role-btn teacher">教師</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.querySelector(".student").addEventListener("click", () => {
    userRole = "学生";
    alert("学生モードで開きます。");
    closeRoleModal();
  });

  document.querySelector(".teacher").addEventListener("click", () => {
    showPasswordModal();
  });
}

function showPasswordModal() {
  const passModal = document.createElement("div");
  passModal.id = "passModal";
  passModal.innerHTML = `
    <div class="role-modal-bg">
      <div class="role-modal">
        <h2>教師用暗証番号を入力してください</h2>
        <input type="password" id="teacherPass" placeholder="暗証番号を入力">
        <div class="role-buttons">
          <button class="role-btn confirm">確認</button>
          <button class="role-btn cancel">キャンセル</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(passModal);

  document.querySelector(".confirm").addEventListener("click", () => {
    const pass = document.getElementById("teacherPass").value;
    if (pass === "1234") {
      alert("認証成功。教師モードで開きます。");
      userRole = "教師";
      closePassModal();
      closeRoleModal();
    } else {
      alert("暗証番号が間違っています。");
    }
  });

  document.querySelector(".cancel").addEventListener("click", () => {
    document.getElementById("passModal").remove();
  });
}

function closeRoleModal() {
  document.getElementById("roleModal").remove();
  renderCalendar(currentMonth, currentYear);
}

function closePassModal() {
  document.getElementById("passModal").remove();
}

// =============================
// カレンダー機能
// =============================
let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let events = JSON.parse(localStorage.getItem("events") || "[]");

const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const modalBg = document.getElementById("modalBg");
const modalDate = document.getElementById("modalDate");
const eventList = document.getElementById("eventList");
const eventTime = document.getElementById("eventTime");
const eventTitle = document.getElementById("eventTitle");
const eventMemo = document.getElementById("eventMemo");

function renderCalendar(month, year) {
  if (!userRole) return;

  calendarGrid.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthLabel.textContent = `${year}年 ${month + 1}月`;

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    const dateStr = `${year}-${month + 1}-${d}`;
    dayDiv.textContent = d;

    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear())
      dayDiv.classList.add("today");

    const visibleEvents = events.filter(e => {
      if (userRole === "学生") {
        // 学生は自分と教師の予定が見れる
        return e.role === "学生" || e.role === "教師";
      } else {
        // 教師は自分（教師）の予定のみ見れる
        return e.role === "教師";
      }
    }).filter(e => e.date === dateStr);

    if (visibleEvents.length > 0) {
      dayDiv.classList.add("has-event");
      visibleEvents.slice(0, 2).forEach(e => {
        const preview = document.createElement("div");
        preview.className = "event-preview";
        preview.textContent = (e.time ? e.time + " " : "") + e.title;
        dayDiv.appendChild(preview);
      });
      if (visibleEvents.length > 2) {
        const more = document.createElement("div");
        more.className = "event-preview";
        more.textContent = "…その他";
        dayDiv.appendChild(more);
      }
    }

    dayDiv.addEventListener("click", () => openModal(dateStr));
    calendarGrid.appendChild(dayDiv);
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
}

// =============================
// モーダル操作
// =============================
function openModal(date) {
  modalDate.textContent = date;
  modalBg.style.display = "flex";
  showEvents(date);
}

function closeModal() {
  modalBg.style.display = "none";
  eventTime.value = "";
  eventTitle.value = "";
  eventMemo.value = "";
}

// =============================
// イベント処理
// =============================
function showEvents(date) {
  eventList.innerHTML = "";
  const dayEvents = events.filter(e => e.date === date && (
    (userRole === "教師" && e.role === "教師") ||
    (userRole === "学生" && (e.role === "教師" || e.role === "学生"))
  ));

  if (dayEvents.length === 0) {
    eventList.innerHTML = "<div>予定なし</div>";
  } else {
    dayEvents.forEach((e, index) => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <div class="event-time">${e.time || "時間指定なし"}</div>
        <div class="event-title">${e.title}</div>
        ${e.memo ? `<div class="event-memo">${e.memo}</div>` : ""}
        ${
          (userRole === "教師" && e.role === "教師") ||
          (userRole === "学生" && e.role === "学生")
            ? `<button class="delete-btn" onclick="deleteEvent('${date}',${index})">×</button>`
            : ""
        }
      `;
      eventList.appendChild(div);
    });
  }
}

function addEvent() {
  const date = modalDate.textContent;
  const time = eventTime.value;
  const title = eventTitle.value.trim();
  const memo = eventMemo.value.trim();

  if (!title) return alert("予定を入力してください！");

  const newEvent = { date, time, title, memo, role: userRole };
  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth, currentYear);

  eventTime.value = "";
  eventTitle.value = "";
  eventMemo.value = "";
}

function deleteEvent(date, index) {
  events = events.filter((e, i) => !(e.date === date && i === index));
  localStorage.setItem("events", JSON.stringify(events));
  showEvents(date);
  renderCalendar(currentMonth, currentYear);
}
