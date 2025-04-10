let urlValue = "testurl";
let usefulcount = 0;
let wowcount = 0;
let touchedcount = 0;
let analyticalcount = 0;
let recommendcount = 0;

const journalistNameElement = document.querySelector('.media_end_head_journalist_name');
const journalistUrlElement = document.querySelector('a.media_journalistcard_summary_photo');
urlValue = journalistUrlElement.getAttribute('href');

console.log(urlValue)

if (journalistNameElement) {
  const journalistName = journalistNameElement.innerText.trim();
  chrome.storage.local.set({ journalist: journalistName }, function() {
    console.log("Journalist name saved:", journalistName);
  });
}

function update() {
  let likeCountElement = document.querySelectorAll('div._reactionModule.u_likeit.nv_notrans span.u_likeit_list_count._count');
  let usefulcount = parseInt(likeCountElement[0].textContent) || 0;
  let wowcount = parseInt(likeCountElement[1].textContent) || 0;
  let touchedcount = parseInt(likeCountElement[2].textContent) || 0;
  let analyticalcount = parseInt(likeCountElement[3].textContent) || 0;
  let recommendcount = parseInt(likeCountElement[4].textContent) || 0;

  console.log("journalisturl: ", urlValue)
  console.log("useful: ", usefulcount)
  console.log("wow: ", wowcount)
  console.log("touched: ", touchedcount)
  console.log("analytical: ", analyticalcount)
  console.log("recommend: ", recommendcount)

  chrome.storage.local.set(
                  {
                      journalisturl: urlValue,
                      useful: usefulcount,
                      wow: wowcount,
                      touched: touchedcount,
                      analytical: analyticalcount,
                      recommend: recommendcount,
                  },
                  function () {
                      console.log("Data stored in local storage");
                  }
              );
}

async function getAverageByAPI(url) {
    try {
        let journalUrl = window.location.pathname

        const response = await fetch("https://pdf.pseudolab-devfactory.com/api/journalist/average-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "articleurl": url,
                "journalisturl": journalUrl,
            }),
        });

        const result = await response.json();
        const allZero = await Object.values(result).slice(1).every(value => value === 0);

        if (false) {
            console.log("부족한 데이터로 조회가 어렵습니다.");
            alert("부족한 데이터로 조회가 어렵습니다.");
        } else {
            chrome.storage.local.set(
                {
                    journalisturl: result.journalisturl,
                    useful_avg: result.useful,
                    wow_avg: result.wow,
                    touched_avg: result.touched,
                    analytical_avg: result.analytical,
                    recommend_avg: result.recommend,
                },
                function () {
                    console.log("Data stored in local storage");
                }
            );
            console.log("Data stored:", result);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("데이터 조회 중 오류가 발생했습니다.");
    }
}

async function postJournalInfoToDB(url){
    try {
        let likeCountElement = document.querySelectorAll('div._reactionModule.u_likeit.nv_notrans span.u_likeit_list_count._count');
        let usefulcount = parseInt(likeCountElement[0].textContent) || 0;
        let wowcount = parseInt(likeCountElement[1].textContent) || 0;
        let touchedcount = parseInt(likeCountElement[2].textContent) || 0;
        let analyticalcount = parseInt(likeCountElement[3].textContent) || 0;
        let recommendcount = parseInt(likeCountElement[4].textContent) || 0;
        let journalUrl = window.location.pathname

        const response = await fetch("https://pdf.pseudolab-devfactory.com/api/journalist/add-score", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "articleurl": url,
            "journalisturl": journalUrl,
            "useful": usefulcount,
            "touched": touchedcount,
            "recommend": recommendcount,
            "analytical": analyticalcount,
            "wow": wowcount
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);
      } catch (error) {
        console.error("API Error:", error);
      };
}

setTimeout(async function () {
    try {
        update();
        postJournalInfoToDB(urlValue);
        getAverageByAPI(urlValue);
    } catch (error) {
        console.error("setTimeout 오류:", error);
    }
}, 1000);
