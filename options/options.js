// Lưu trữ các tham chiếu đến các phần tử DOM
const sourceLanguageSelect = document.getElementById('source-language');
const targetLanguageSelect = document.getElementById('target-language');
const themeSelect = document.getElementById('theme-select');
const saveButton = document.getElementById('save-options');
const resetButton = document.getElementById('reset-options');
const exportCsvButton = document.getElementById('export-csv');
const exportJsonButton = document.getElementById('export-json');
const clearDataButton = document.getElementById('clear-data');
const statusElement = document.getElementById('status');

// Các giá trị mặc định
const defaultOptions = {
  sourceLanguage: 'en',
  targetLanguage: 'vi',
  theme: 'light'
};

// Hiển thị thông báo trạng thái
function showStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
  
  // Tự động ẩn thông báo sau 3 giây
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = 'status-message';
  }, 3000);
}

// Lưu tùy chọn vào storage
function saveOptions() {
  const options = {
    sourceLanguage: sourceLanguageSelect.value,
    targetLanguage: targetLanguageSelect.value,
    theme: themeSelect.value
  };
  
  chrome.storage.local.set({ options }, () => {
    showStatus('Đã lưu tùy chọn!');
    applyTheme(options.theme);
  });
}

// Tải tùy chọn từ storage
function loadOptions() {
  chrome.storage.local.get({ options: defaultOptions }, (result) => {
    const options = result.options;
    
    sourceLanguageSelect.value = options.sourceLanguage;
    targetLanguageSelect.value = options.targetLanguage;
    themeSelect.value = options.theme;
    
    // Áp dụng chủ đề
    applyTheme(options.theme);
  });
}

// Khôi phục tùy chọn mặc định
function resetOptions() {
  sourceLanguageSelect.value = defaultOptions.sourceLanguage;
  targetLanguageSelect.value = defaultOptions.targetLanguage;
  themeSelect.value = defaultOptions.theme;
  
  saveOptions();
  showStatus('Đã khôi phục tùy chọn mặc định!');
}

// Áp dụng chủ đề
function applyTheme(theme) {
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Xuất dữ liệu dưới dạng CSV
function exportAsCSV() {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    if (result.vocabList.length === 0) {
      showStatus('Không có từ vựng để xuất!', true);
      return;
    }
    
    // Tạo nội dung CSV
    const csvContent = 'Word,Meaning\n' + 
      result.vocabList.map(item => `"${item.text}","${item.meaning}"`).join('\n');
    
    // Tạo và tải xuống file
    downloadFile(csvContent, 'vocab-list.csv', 'text/csv');
    showStatus('Đã xuất CSV thành công!');
  });
}

// Xuất dữ liệu dưới dạng JSON
function exportAsJSON() {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    if (result.vocabList.length === 0) {
      showStatus('Không có từ vựng để xuất!', true);
      return;
    }
    
    // Tạo nội dung JSON
    const jsonContent = JSON.stringify(result.vocabList, null, 2);
    
    // Tạo và tải xuống file
    downloadFile(jsonContent, 'vocab-list.json', 'application/json');
    showStatus('Đã xuất JSON thành công!');
  });
}

// Hàm tải xuống file
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Xóa tất cả dữ liệu từ vựng
function clearAllData() {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả từ vựng đã lưu? Hành động này không thể hoàn tác.')) {
    chrome.storage.local.set({ vocabList: [] }, () => {
      showStatus('Đã xóa tất cả từ vựng!');
    });
  }
}

// Đăng ký các sự kiện
saveButton.addEventListener('click', saveOptions);
resetButton.addEventListener('click', resetOptions);
exportCsvButton.addEventListener('click', exportAsCSV);
exportJsonButton.addEventListener('click', exportAsJSON);
clearDataButton.addEventListener('click', clearAllData);

// Theo dõi thay đổi chủ đề hệ thống
if (window.matchMedia) {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', () => {
    chrome.storage.local.get({ options: defaultOptions }, (result) => {
      if (result.options.theme === 'system') {
        applyTheme('system');
      }
    });
  });
}

// Tải tùy chọn khi trang được tải
document.addEventListener('DOMContentLoaded', loadOptions);