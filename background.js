// Tạo menu ngữ cảnh khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  
  // Khởi tạo các tùy chọn mặc định nếu chưa có
  chrome.storage.local.get({ options: null }, (result) => {
    if (!result.options) {
      chrome.storage.local.set({
        options: {
          sourceLanguage: 'en',
          targetLanguage: 'vi',
          theme: 'light'
        }
      });
    }
  });
  
  chrome.contextMenus.create({
    id: "saveVocab",
    title: "Save '%s'",
    contexts: ["selection"],
  });
});

// Lắng nghe sự kiện menu được nhấp
chrome.contextMenus.onClicked.addListener((e) => {
  if (e.menuItemId === "saveVocab" && e.selectionText) {
    saveWordToStorage(e.selectionText.trim());
  }
});

// Lắng nghe message từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveWord") {
    saveWordToStorage(request.word)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true; // Giữ message port mở cho async response
  }
});

// Hàm lưu từ vào storage
async function saveWordToStorage(word) {
  try {
    // Dịch từ
    const meaning = await translateWithMyMemory(word);

    // Lấy danh sách từ hiện tại
    const result = await chrome.storage.local.get({ vocabList: [] });

    // Thêm từ mới
    const newVocabList = [
      ...result.vocabList,
      { text: word, meaning: meaning },
    ];

    // Lưu vào storage
    await chrome.storage.local.set({ vocabList: newVocabList });

    return true;
  } catch (error) {
    throw error;
  }
}

// API dịch
// 1000 requests/ngày miễn phí
const translateWithMyMemory = async (text) => {
  // Lấy tùy chọn ngôn ngữ từ storage
  const result = await chrome.storage.local.get({
    options: {
      sourceLanguage: 'en',
      targetLanguage: 'vi'
    }
  });
  
  const sourceLang = result.options.sourceLanguage;
  const targetLang = result.options.targetLanguage;
  
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${sourceLang}|${targetLang}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data.responseData.translatedText;
};

async function translateWord(word) {
  try {
    // Lấy tùy chọn ngôn ngữ từ storage
    const result = await chrome.storage.local.get({
      options: {
        sourceLanguage: 'en',
        targetLanguage: 'vi'
      }
    });
    
    const sourceLang = result.options.sourceLanguage;
    const targetLang = result.options.targetLanguage;
    
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        word
      )}&langpair=${sourceLang}|${targetLang}`
    );

    if (!response.ok) {
      throw new Error("Translation API error");
    }

    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    return "(Không dịch được)";
  }
}

// Cập nhật badge
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.vocabList) {
    updateBadge();
  }
});

function updateBadge() {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const count = result.vocabList.length;
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : "",
    });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  });
}
