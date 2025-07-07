// Tải danh sách từ vựng
chrome.storage.local.get({ vocabList: [] }, (result) => {
  const tbody = document.getElementById("vocab-list");
  tbody.innerHTML = "";

  result.vocabList.forEach((word, idx) => {
    const tr = document.createElement("tr");

    const tdWord = document.createElement("td");
    tdWord.textContent = word.text;
    tr.appendChild(tdWord);

    const tdMeaning = document.createElement("td");
    tdMeaning.textContent = word.meaning;
    tr.appendChild(tdMeaning);

    const tdAction = document.createElement("td");
    // Tạo nút âm thanh
    const audioBtn = document.createElement("button");
    audioBtn.textContent = "🔊";
    audioBtn.className = "speak-btn";
    audioBtn.title = "Phát âm";
    audioBtn.onclick = () => {
      const utter = new SpeechSynthesisUtterance(word.text);
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    };
    tdAction.appendChild(audioBtn);

    // Tạo nút xóa
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Xóa";
    deleteBtn.onclick = () => {
      result.vocabList.splice(idx, 1);
      chrome.storage.local.set({ vocabList: result.vocabList }, () => {
        location.reload();
      });
    };
    tdAction.appendChild(deleteBtn);

    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
});

// Nút thêm từ thủ công
const addBtn = document.getElementById("add-vocab");
addBtn.onclick = () => {
  const word = prompt("Nhập từ mới:");
  if (word && word.trim()) {
    chrome.runtime.sendMessage(
      { action: "saveWord", word: word.trim() },
      (response) => {
        if (response?.success) {
          location.reload();
        } else {
          alert("Lỗi khi lưu từ!");
        }
      }
    );
  }
};

//dark mode toggle
const darkBtn = document.getElementById("toggle-dark");

function updateDarkIcon(){
  darkBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}

darkBtn.onclick = () =>{
  document.body.classList.toggle("dark-mode");
  
  // Lấy tùy chọn hiện tại
  chrome.storage.local.get({ options: { theme: 'light' } }, (result) => {
    const options = result.options;
    
    // Cập nhật chủ đề
    options.theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    
    // Lưu lại tùy chọn
    chrome.storage.local.set({ options });
  });
  
  updateDarkIcon();
}

// Tải trạng thái chủ đề từ tùy chọn
chrome.storage.local.get({ options: { theme: 'light' } }, (result) => {
  const theme = result.options.theme;
  
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  
  updateDarkIcon();
});

// Mở trang tùy chọn
const optionsBtn = document.getElementById("open-options");
optionsBtn.onclick = () => {
  chrome.runtime.openOptionsPage();
};