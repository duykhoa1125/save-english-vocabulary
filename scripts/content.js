// Thêm CSS
const style = document.createElement("link");
style.rel = "stylesheet";
style.type = "text/css";
style.href = chrome.runtime.getURL("scripts/content.css");
document.head.appendChild(style);

// Tạo icon add
const icon = document.createElement("div");
icon.id = "add-icon";
icon.style.backgroundImage = `url(${chrome.runtime.getURL(
  "images/add-icon.png"
)})`;
document.body.appendChild(icon);

// Biến để lưu từ hiện tại
let currentWord = "";

// Xử lý khi nhấn vào icon
icon.addEventListener("click", function () {
  if (currentWord) {
    const wordToSave = currentWord; // Lưu lại từ trước khi reset
    chrome.runtime.sendMessage(
      {
        action: "saveWord",
        word: wordToSave,
      },
      function (response) {
        if (chrome.runtime.lastError) {
          showMessage("Lỗi: " + chrome.runtime.lastError.message, "error");
        } else if (response && response.success) {
          showMessage(`Đã lưu từ: "${wordToSave}"`, "success");
        } else {
          showMessage("Lỗi khi lưu từ", "error");
        }
      }
    );
  }

  hideIcon();
});

// Hiển thị thông báo
function showMessage(text, type) {
  const message = document.createElement("div");
  message.textContent = text;
  let bgColor = "#4CAF50",
    color = "white";
  if (type !== "success") {
    bgColor = "#f44336";
    color = "white";
  }
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 5px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    background: ${bgColor};
    color: ${color};
  `;

  document.body.appendChild(message);

  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}

// Hiển thị icon tại vị trí
function showIconAt(x, y) {
  icon.style.left = x + 10 + "px";
  icon.style.top = y - 40 + "px";
  icon.classList.add("show");
}

// Ẩn icon
function hideIcon() {
  icon.classList.remove("show");
  currentWord = "";
}

// Xử lý selection
document.addEventListener("mouseup", function (e) {
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text && text.length > 0) {
      currentWord = text;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showIconAt(rect.left + rect.width / 2, rect.top + window.scrollY);
      }
    } else {
      hideIcon();
    }
  }, 10);
});

// Ẩn icon khi nhấn ra ngoài
document.addEventListener("mousedown", function (e) {
  if (e.target !== icon) {
    hideIcon();
  }
});

// Ẩn icon khi scroll
document.addEventListener("scroll", function () {
  hideIcon();
});
