// =============================
// ロール選択モーダル（毎回表示）
// =============================
let userRole = null;

window.addEventListener("load", () => {
  showRoleModal();
});

function showRoleModal() {
  const modalBg = document.createElement("div");
  modalBg.id = "roleModalBg";
  modalBg.className = "role-modal-bg";
  modalBg.innerHTML = `
    <div class="role-modal">
      <h2>あなたの区分を選んでください</h2>
      <div class="role-buttons">
        <button class="role-btn student">学生</button>
        <button class="role-btn teacher">教師</button>
      </div>
      <div id="teacherPassArea" style="display:none;margin-top:12px;">
        <input type="password" id="teacherPass" placeholder="暗証番号">
        <button class="role-btn confirm" style="margin-top:8px;">確認</button>
        <button class="role-btn cancel" style="margin-top:4px;">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalBg);

  // 学生ボタン
  modalBg.querySelector(".student").addEventListener("click", () => {
    userRole = "学生";
    alert("学生モードで開きます。");
    closeRoleModal();
  });

  // 教師ボタン
  modalBg.querySelector(".teacher").addEventListener("click", () => {
    modalBg.querySelector("#teacherPassArea").style.display = "block";
  });

  // 教師パス確認
  modalBg.querySelector(".confirm").addEventListener("click", () => {
    const pass = modalBg.querySelector("#teacherPass").value;
    if (pass === "1234") {
      userRole = "教師";
      alert("認証成功。教師モードで開きます。");
      closeRoleModal();
    } else {
      alert("暗証番号が間違っています。");
    }
  });

  // 教師パスキャンセル
  modalBg.querySelector(".cancel").addEventListener("click", () => {
    modalBg.querySelector("#teacherPassArea").style.display = "none";
  });
}

// モーダル閉じる
function closeRoleModal() {
  const modalBg = document.getElementById("roleModalBg");
  if (modalBg) modalBg.remove();
  renderCalendar(currentMonth, currentYear);
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
const modalBgElement = document.getElementById("modalBg");
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

  // 空セル
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  // 日付セル
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    const dateStr = `${year}-${month + 1}-${d}`;
    dayDiv.textContent = d;

    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear())
      dayDiv.classList.add("today");

    const visibleEvents = events.filter(e => {
      if (userRole === "学生") {
        return e.role === "学生" || e.role === "教師";
      } else {
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
  modalBgElement.style.display = "flex";
  showEvents(date);
}

function closeModal() {
  modalBgElement.style.display = "none";
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
