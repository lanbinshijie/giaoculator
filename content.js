console.log("Content script is running...");

let SaveOverallScore = "-";
let SaveGPADisplay = "-";
let SaveGPAValue = "-";

if (window.myInterval) {
    clearInterval(window.myInterval);
}

function updateContent() {
    console.log("Checking for target element...");
    const targetElement = document.querySelector('.fe-components-stu-app-task-stat-__containerBody--37aNor2CicrLBH0qmwwofX');
    
    if (targetElement) {
        clearInterval(checkInterval); 
        console.log("Target element found!");
        
        let overallScore = SaveOverallScore;
        let gpaDisplayName = SaveGPADisplay;
        let gpaValue = SaveGPAValue;

        targetElement.innerText = `${overallScore} / ${gpaDisplayName} / ${gpaValue}`;
    } else {
        console.log("Target element not found.");
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // console.log(data);
    let type = message.type
    let data = message.data
    if (type == "m1"){
        if (data.overallScore && data.gpaDisplayName && data.gpaValue) {
            SaveOverallScore = data.overallScore;
            SaveGPADisplay = data.gpaDisplayName;
            SaveGPAValue = data.gpaValue;
            const targetElement = document.querySelector('.fe-components-stu-app-task-stat-__containerBody--37aNor2CicrLBH0qmwwofX');
            if (targetElement) {
                targetElement.innerText = `${(data.overallScore*1.0).toFixed(1)} / ${data.gpaDisplayName} / ${data.gpaValue}`;
                clearInterval(checkInterval);  // 这里也清除定时器
            }
        }
    } else if (type == "m2") {
        console.log("Pipi is pig")
    }
});


// 使用定时器每隔1秒检查一次目标元素
const checkInterval = setInterval(updateContent, 1000);
