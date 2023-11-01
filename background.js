let processingUrls = {};
let categoryCache = {};

const gpaRules = [
    {"displayName":"A+","minValue":97.00,"maxValue":9999.90,"sort":0,"gpa":4.30},
    {"displayName":"A","minValue":93.00,"maxValue":96.90,"sort":1,"gpa":4.00},
    {"displayName":"A-","minValue":90.00,"maxValue":92.90,"sort":2,"gpa":3.70},
    {"displayName":"B+","minValue":87.00,"maxValue":89.90,"sort":3,"gpa":3.30},
    {"displayName":"B","minValue":83.00,"maxValue":86.90,"sort":4,"gpa":3.00},
    {"displayName":"B-","minValue":80.00,"maxValue":82.90,"sort":5,"gpa":2.70},
    {"displayName":"C+","minValue":77.00,"maxValue":79.90,"sort":6,"gpa":2.30},
    {"displayName":"C","minValue":73.00,"maxValue":76.90,"sort":7,"gpa":2.00},
    {"displayName":"C-","minValue":70.00,"maxValue":72.90,"sort":8,"gpa":1.70},
    {"displayName":"D+","minValue":67.00,"maxValue":69.90,"sort":9,"gpa":1.30},
    {"displayName":"D","minValue":63.00,"maxValue":66.90,"sort":10,"gpa":1.00},
    {"displayName":"D-","minValue":60.00,"maxValue":62.90,"sort":11,"gpa":0.70},
    {"displayName":"F","minValue":0.00,"maxValue":59.90,"sort":12,"gpa":0.00}
];




chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const LoginPattern = "https://tsinglanstudent.schoolis.cn/";
    // 当URL变化时，重新注入内容脚本
    if (changeInfo.url && tab.url.includes("https://tsinglanstudent.schoolis.cn/Home#!/task/stat")) {

        // 清除先前的content.js实例
        chrome.tabs.executeScript(tabId, {
            code: `
                if (window.checkInterval) {
                    clearInterval(window.checkInterval);
                    window.checkInterval = null;
                }
            `
        }, () => {
            // 重新注入新的content.js实例
            if (!window.contentScriptInjected) {
            chrome.tabs.executeScript(tabId, {file: "content.js"});
            window.contentScriptInjected = true;
        }
        });
    } else if (changeInfo.url && tab.url.includes("https://tsinglanstudent.schoolis.cn/Home#!/realtime/list")) {
        console.log(1)
        // chrome.tabs.executeScript(tabId, {file: "gpa.js"});
        // injectGPA();
    } else if (tab.url === LoginPattern) {
        localStorage.clear();
        console.log("localStorageCLeared");
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
        const detailsUrlPattern = "https://tsinglanstudent.schoolis.cn/api/DynamicScore/GetStuSemesterDynamicScore?semesterId=24699";
        const GPAUrlPattern = "https://tsinglanstudent.schoolis.cn/api/DynamicScore/GetGpa?semesterId=24699";
        const GiaoculatorClassUrlPattern = "https://tsinglanstudent.schoolis.cn/api/DynamicScore/GetDynamicScoreDetail?classId=277851&subjectId=100628&semesterId=24699"

        // 检查请求的URL是否匹配
        if (details.url.startsWith(detailsUrlPattern)) {
            await fetch_courses_info();
            let totalCourse = [];
            let template = {"grade":null,"classType":2,"classId":277851,"className":"GPA Calculator","classEName":"GPA Calculator","subjectId":100628,"subjectName":"Giaoculator","subjectEName":"Giaoculator","isInGrade":true,"subjectScore":100,"scoreMappingId":4517,"updateDate":"\/Date(0000000000000+0800)\/","subjectTotalScore":100.0,"scoreType":1,"levelString":"A+"};

            // 获取所有的course
            let courseInfoList = getAllCourseInfo();
            // 依次添加到totalCourse中，按照template的格式，替换其中的className和subjectName、subjectEName和classEName，还有subjectScore
            let add_count = 0;
            for (let courseInfo of courseInfoList) {
                let course = JSON.parse(JSON.stringify(template));
                course.className = courseInfo.ename;
                course.classEName = courseInfo.ename;
                course.subjectName = courseInfo.ename;
                course.subjectEName = courseInfo.ename;
                course.subjectScore = courseInfo.gpa;
                totalCourse.push(course);
                add_count+=1;
            }
            if (add_count < 1){
                let course = JSON.parse(JSON.stringify(template));
                course.className = "请先前往“任务统计”页面";
                course.classEName = "Please Calculate First";
                course.subjectName = "未获取到信息";
                course.subjectEName = "Info Not Found";
                course.subjectScore = "0";
                totalCourse.push(course);
            }
            courseInfoList += {"grade":null,"classType":2,"classId":277851,"className":"GPA Calculator","classEName":"GPA Calculator","subjectId":100628,"subjectName":"Giaoculator","subjectEName":"Giaoculator","isInGrade":true,"subjectScore":100,"scoreMappingId":4517,"updateDate":"\/Date(0000000000000+0800)\/","subjectTotalScore":100.0,"scoreType":1,"levelString":"A+"}
            // 添加到返回的JSON中


            return {
                redirectUrl: "data:application/json," + encodeURIComponent(JSON.stringify({
                    data: {
                        studentSemesterDynamicScoreBasicDtos: totalCourse,
                        "scoreMappingList": [
                            {"scoresMappingId":4517,"isUseGpa":true,"scoreMappingConfigs":[{"displayName":"A+","minValue":97.00,"maxValue":9999.90,"isContainMin":true,"isContainMax":true,"sort":0,"gpa":4.30},{"displayName":"A","minValue":93.00,"maxValue":96.90,"isContainMin":true,"isContainMax":true,"sort":1,"gpa":4.00},{"displayName":"A-","minValue":90.00,"maxValue":92.90,"isContainMin":true,"isContainMax":true,"sort":2,"gpa":3.70},{"displayName":"B+","minValue":87.00,"maxValue":89.90,"isContainMin":true,"isContainMax":true,"sort":3,"gpa":3.30},{"displayName":"B","minValue":83.00,"maxValue":86.90,"isContainMin":true,"isContainMax":true,"sort":4,"gpa":3.00},{"displayName":"B-","minValue":80.00,"maxValue":82.90,"isContainMin":true,"isContainMax":true,"sort":5,"gpa":2.70},{"displayName":"C+","minValue":77.00,"maxValue":79.90,"isContainMin":true,"isContainMax":true,"sort":6,"gpa":2.30},{"displayName":"C","minValue":73.00,"maxValue":76.90,"isContainMin":true,"isContainMax":true,"sort":7,"gpa":2.00},{"displayName":"C-","minValue":70.00,"maxValue":72.90,"isContainMin":true,"isContainMax":true,"sort":8,"gpa":1.70},{"displayName":"D+","minValue":67.00,"maxValue":69.90,"isContainMin":true,"isContainMax":true,"sort":9,"gpa":1.30},{"displayName":"D","minValue":63.00,"maxValue":66.90,"isContainMin":true,"isContainMax":true,"sort":10,"gpa":1.00},{"displayName":"D-","minValue":60.00,"maxValue":62.90,"isContainMin":true,"isContainMax":true,"sort":11,"gpa":0.70},{"displayName":"F","minValue":0.00,"maxValue":59.90,"isContainMin":true,"isContainMax":true,"sort":12,"gpa":0.00}]}
                        ],
                    },
                    msgCN: null,
                    msgEN: null,
                    state: 0,
                    msg: null
                }))
            };
        } else if (details.url.startsWith(GPAUrlPattern)) {
            // gpa = getFromLocalStorage(0).gpa => number;
            let totalGPA = 0;
            let scores = getAllGPAValues();
            let gpas = [];
            // 根据gpaRules将scores转换为gpa，然后加入gpas列表
            for (let score of scores) {
                for (let rule of gpaRules) {
                    if (score >= rule.minValue && score <= rule.maxValue) {
                        gpas.push(rule.gpa);
                        break;
                    }
                }
            }

            // 计算平均GPA
            for (let gpa of gpas) {
                totalGPA += gpa;
            }
            let avgGPA = totalGPA / gpas.length;

            return {
                redirectUrl: "data:application/json," + encodeURIComponent(JSON.stringify({
                    // "data": avgGPA, 两位小数
                    "data": avgGPA.toFixed(2),
                    "msgCN": null,
                    "msgEN": null,
                    "state": 0,
                    "msg": null
                }))
            }
        } else if (details.url.startsWith(GiaoculatorClassUrlPattern)) {

            return {
                redirectUrl: "data:application/json," + encodeURIComponent(JSON.stringify({
                    data: {
                        evaluationProjectList: [
                            {evaluationProjectName: "该成绩由Gicoculator计算",evaluationProjectEName: "Calculated by Giaoculator",proportion: 100,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "73",evaluationProjectId: 30469,proPath: "30469,",parentProId: 0,evaluationProjectRemark: null},
                           // {evaluationProjectName: "",evaluationProjectEName: "Calculated by Giaoculator",proportion: 100,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "74",evaluationProjectId: 30468,proPath: "30468,",parentProId: 0,evaluationProjectRemark: null},
                           // {evaluationProjectName: "",evaluationProjectEName: "Leo Huo",proportion: 25,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "75",evaluationProjectId: 30470,proPath: "30470,",parentProId: 0,evaluationProjectRemark: null},
                           // {evaluationProjectName: "",evaluationProjectEName: "G9 Coders With ❤️",proportion: 25,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "003",evaluationProjectId: 1220,proPath: "1220,",parentProId: 0,evaluationProjectRemark: null}
                        ]
                      },
                      msgCN: null,
                      msgEN: null,
                      state: 0,
                      msg: null
                }))
            }
        } else if (details.url.startsWith("NOURLITISJUSTATEMP")) {

            return {
                redirectUrl: "data:application/json," + encodeURIComponent(JSON.stringify({
                    data: {
                        evaluationProjectList: [
                            {evaluationProjectName: "综合性评估",evaluationProjectEName: "Comprehensive Assessments",proportion: 20,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "73",evaluationProjectId: 30468,proPath: "30468,",parentProId: 0,evaluationProjectRemark: null},
                            {evaluationProjectName: "连续性评估",evaluationProjectEName: "Continuous Assessments",proportion: 30,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "74",evaluationProjectId: 30469,proPath: "30469,",parentProId: 0,evaluationProjectRemark: null},
                            {evaluationProjectName: "渐进式评估",evaluationProjectEName: "Progressive Assessments",proportion: 30,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "75",evaluationProjectId: 30470,proPath: "30470,",parentProId: 0,evaluationProjectRemark: null},
                            {evaluationProjectName: "期末考试",evaluationProjectEName: "Final exam",proportion: 20,score: 0,scoreLevel: "",gpa: 0,scoreIsNull: true,evaluationProjectList: [],levelString: "",code: "003",evaluationProjectId: 1220,proPath: "1220,",parentProId: 0,evaluationProjectRemark: null}
                        ]
                      },
                      msgCN: null,
                      msgEN: null,
                      state: 0,
                      msg: null
                }))
            }

        }
    },
    

    {
        urls: ["<all_urls>"],
        types: ["xmlhttprequest"]
    },
    ["blocking"]
);


chrome.webRequest.onCompleted.addListener(
    async function(details) {
        if (details.url.includes("GetStatistics?") && !processingUrls[details.url]) {
            //ClearConsole

            // console.clear();


            //Get SubjectName

            let url = new URL(details.url);
            let semesterId = url.searchParams.get("schoolSemesterId");
            let subjectId = url.searchParams.get("subjectId");

            // Fetch the subject eName
            let subjectInfo = await fetchSubjectEName(semesterId, subjectId);
            
            // Mark URL as being processed to avoid infinite loop
            processingUrls[details.url] = true;
            
            // Use XMLHttpRequest to fetch the response data
            var xhr = new XMLHttpRequest();
            xhr.open("GET", details.url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    // Parse the response data as JSON
                    var response = JSON.parse(xhr.responseText);
                    
                    // Extract the necessary information
                    var extracted_data = [];
                    var pendingRequests = 0;
                    for (var item of response.data.list) {
                        let dataItem = {
                            "id": item.id,
                            "taskName": item.learningTaskName,
                            "learningTaskTypeEName": item.learningTaskTypeEName,
                            "score": item.score,
                            "totalScore": item.totalScore
                        };
                        
                        pendingRequests++;
                        fetchCategoryAndProportion(item.id, dataItem, function(updatedItem) {
                            extracted_data.push(updatedItem);
                            pendingRequests--;
                            if  (pendingRequests === 0){
                                console.log(extracted_data);
                                let gpa = calculateOverallScore(extracted_data);
                                printCategorySummary(extracted_data);  // If you also want to print the summary
                                console.log("SUBJECT", subjectInfo)
                                saveSubjectInfo(subjectId, extracted_data, subjectInfo, gpa)

                            }
                        });
                    }
                    
                    if (pendingRequests === 0) {
                        console.log(extracted_data);
                        let gpa = calculateOverallScore(extracted_data);

                        saveSubjectInfo(subjectId, extracted_data, subjectInfo, gpa)

                        printCategorySummary(extracted_data);  // 新增这一行来调用新函数
                    }
                    
                    // Once processed, remove the URL from the processing list
                    setTimeout(() => { delete processingUrls[details.url]; }, 5000);
                }
            }
            xhr.send();
        }
    },
    { urls: ["https://tsinglanstudent.schoolis.cn/*"] }
);

function fetchCategoryAndProportion(taskId, dataItem, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `https://tsinglanstudent.schoolis.cn/api/LearningTask/GetDetail?learningTaskId=${taskId}`, true);
    resetUI();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            let response = JSON.parse(xhr.responseText);
            let category = "Not For GPA / 不计入";
            let proportion = 0;
            try{
                category = response.data.evaProjects[0].eName;
                proportion = response.data.evaProjects[0].proportion;
            }
            catch(e){
                proportion = 0;
                category = "Not For GPA / 不计入";
            }

            dataItem["category"] = category;
            dataItem["proportion"] = proportion;
            callback(dataItem);
        }
    }
    xhr.send();
}



function printCategorySummary(data) {
    
    let categorySummary = {};
    // 0. 分割线
    console.log('=============================================')


    // 1. Group tasks by category
    for (let item of data) {
        let category = item.category;
        let proportion = item.proportion;
        let percentageScore = (item.score / item.totalScore) * 100;

        if (!categorySummary[category]) {
            categorySummary[category] = {
                proportion: proportion,
                totalScore: 0,
                taskCount: 0
            };
        }
        categorySummary[category].totalScore += percentageScore;
        categorySummary[category].taskCount++;
    }

    // 2. Calculate avg and print summary for each category
    for (let category in categorySummary) {
        let avgScore = categorySummary[category].totalScore / categorySummary[category].taskCount;
        console.log(`Category: ${category}`);
        console.log(`Proportion: ${categorySummary[category].proportion}%`);
        console.log(`Number of Tasks: ${categorySummary[category].taskCount}`);
        console.log(`Avg: ${avgScore.toFixed(2)}%`);
        console.log('-------------------');
    }
    overallScore = calculateOverallScore(data);
    var gpaInfo = calculateGPA(overallScore);
    console.log(`*** GPA: ${gpaInfo.gpa.toFixed(2)} / ${gpaInfo.displayName} ***`);
    // 3. 分割线
    console.log('=============================================')
}




function calculateOverallScore(data) {
    let categorySummary = {};
    let totalProportion = 0;

    // 1. Group tasks by category and calculate the avg
    for (let item of data) {
        let category = item.category;
        let proportion = item.proportion;
        let percentageScore = (item.score / item.totalScore) * 100;

        if (!categorySummary[category]) {
            categorySummary[category] = {
                proportion: proportion,
                totalScore: 0,
                taskCount: 0
            };
            totalProportion += proportion;
            //console.log(`D.ProportionAddedBy ${proportion}`);
        }
        categorySummary[category].totalScore += percentageScore;
        categorySummary[category].taskCount++;
    }

    //console.log(`D.TotalProportion:${totalProportion}`);

    // 2. Calculate the overall score
    let overallScore = 0;
    for (let category in categorySummary) {
        let avgScore = categorySummary[category].totalScore / categorySummary[category].taskCount;
        let adjustedProportion = (categorySummary[category].proportion / totalProportion) * 100;
        overallScore += avgScore * (adjustedProportion / 100);
        //console.log(`D.OverallScore+=${avgScore}*${adjustedProportion / 100}`)
    }

    console.log(`*** Overall Score: ${overallScore.toFixed(2)}% ***`);

    let gpaInfo = calculateGPA(overallScore);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let message = {
            type: "m1",
            data: {
                overallScore: overallScore,
                gpaDisplayName: gpaInfo.displayName,
                gpaValue: gpaInfo.gpa.toFixed(2)
            }
        };
        chrome.tabs.sendMessage(tabs[0].id, message);
    });

    return overallScore.toFixed(2)
}


function calculateGPA(overallScore) {
    for (const rule of gpaRules) {
        if (overallScore >= rule.minValue && overallScore <= rule.maxValue) {
            return { displayName: rule.displayName, gpa: rule.gpa };
        }
    }
    return { displayName: "N/A", gpa: 0 };  // Default if no rule matches
}


function resetUI(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let message = {
            type: "m1",
            data: {
                overallScore: "-",
                gpaDisplayName: "-",
                gpaValue: "-"
            }
        };
        try{
            chrome.tabs.sendMessage(tabs[0].id, message);
        }catch(e){
            console.log(`Failed to send message,${e}`)
            console.log(message);
        }
        
    });
}

async function fetchSubjectEName(semesterId, subjectId) {
    // 如果没有提供 semesterId 或 subjectId，可以直接返回 null 或抛出错误
    if (!semesterId || !subjectId) {
        return null;
    }

    const response = await fetch(`https://tsinglanstudent.schoolis.cn/api/LearningTask/GetStuSubjectListForStatisticsSelect?semesterId=${semesterId}`);
    const data = await response.json();

    let subjectData = data.data.find(subject => subject.id == subjectId);
    
    if (subjectData) {
        return {
            ename: subjectData.eName,
            semesterId: semesterId,
            subjectId: subjectId
        };
    }

    // 如果没有找到对应的科目，返回 null
    return null;
}


function saveSubjectInfo(subjectId, dataCollect, dataInfo, gpa){
    console.log(2)
    let data = {
        gpaInfo: dataInfo,
        gpa: gpa,
        tasksInfo: dataCollect,
    }
    if(dataCollect.length > 0) saveToLocalStorage(subjectId, data);
    else console.log("学科暂无成绩，将不会统计到GPA中", data)
}

// 将对象保存到localStorage的函数
function saveToLocalStorage(keyName, obj) {
    console.log(1)
    try {
        const jsonString = JSON.stringify(obj);
        localStorage.setItem(keyName, jsonString);
        console.log(`已存入 ${keyName} 的 Data ${jsonString}`)
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// 从localStorage读取并解析对象的函数
function getFromLocalStorage(keyName) {
    try {
        const jsonString = localStorage.getItem(keyName);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error reading from localStorage or parsing:', error);
        return null;
    }
}

function getAllGPAValues() {
    let gpaList = [];

    // 遍历所有localStorage的键
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // 使用之前的函数来获取每个键的值
        const data = getFromLocalStorage(key);
        
        // 检查对象中是否有gpa属性
        if (data && typeof data.gpa !== 'undefined') {
            // 将gpa值转换为浮点数并加入列表中
            gpaList.push(parseFloat(data.gpa));
        }
    }
    
    return gpaList;
}

function getAllCourseInfo() {
    // 返回内容包括ename, subjectId, gpa(浮点数)
    let courseInfoList = [];
    
    // 遍历所有localStorage的键
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // 使用之前的函数来获取每个键的值
        const data = getFromLocalStorage(key);
        
        // 检查对象中是否有gpa属性
        if (data && typeof data.gpa !== 'undefined') {
            // 将gpa值转换为浮点数并加入列表中
            courseInfoList.push({
                ename: data.gpaInfo.ename,
                subjectId: data.gpaInfo.subjectId,
                gpa: parseFloat(data.gpa)
            });
        }
    }

    return courseInfoList;
}

async function fetch_courses_info() {
    const course_list_r = await fetch("https://tsinglanstudent.schoolis.cn/api/LearningTask/GetStuSubjectListForStatisticsSelect?semesterId=24699")
    let course_list = await course_list_r.json();
    course_list = course_list["data"]
    console.log(course_list)

    let idx = []
    for(let i=0; i<course_list.length; i++){
        idx.push(course_list[i].id)
    }
    console.log(idx)

    

}




