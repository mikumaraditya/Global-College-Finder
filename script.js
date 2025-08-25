let searchbtn=document.querySelector("#searchbtn");
let collegeList=document.querySelector(".college-results");

searchbtn.addEventListener("click",async ()=>{
    let country=document.querySelector("input").value;
    document.querySelector("input").value="";
    if(country===""){
        alert("Please enter the valid country name");
    }
    else{
        try{

        let result=await getColleges(country);

        if (result.length === 0) {
        alert("Please enter a valid country name");
        return;
         }
        // console.log(result);
        collegeList.innerHTML="";
        showColleges(result);
        }catch(e){
            alert("Collage not found");
        }
        

    }
    
});



function showColleges(result){
    let table=document.createElement("table");
    collegeList.appendChild(table);
    table.classList.add("college-table");
    collegeList.style.backgroundColor="white";

    let th1 = document.createElement("th");
    th1.innerText = "College Name";
    let th2 = document.createElement("th");
    th2.innerText = "Website";
    let th3 = document.createElement("th");
    th3.innerText = "Country";
    

    let tr1=document.createElement("tr");
    table.appendChild(tr1);

    tr1.appendChild(th1);
    tr1.appendChild(th2);
    tr1.appendChild(th3);


    
    for (res of result) {
        
        let tr=document.createElement("tr");
        table.appendChild(tr);

        let td1=document.createElement("td");
        let td2=document.createElement("td");
        let td3=document.createElement("td");

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        td1.innerText=res.name;
        td2.innerHTML=`<a href="${res.web_pages[0]}" target="_blank">${res.web_pages[0]}</a>`;
        td3.innerText=res.country;

        // li.innerText=res.name;
        // li2.innerText=res.web_pages;
        // li3.innerText=res.country;
        
    }
}

let url = "https://api.allorigins.win/raw?url=http://universities.hipolabs.com/search?country=";

async function getColleges(country){
    try{
        let res = await axios.get(url+country);
        return res.data;
    }
    catch(e){
        console.log("Error: ",e);
    }
}

function showLoginForm(){
    document.querySelector(".overlay").classList.add("showoverlay");
    document.querySelector(".form").classList.add("showform");
}

function hideLoginForm(){
    document.querySelector(".overlay").classList.remove("showoverlay");
    document.querySelector(".form").classList.remove("showform");
}

let loginBtn = document.querySelector("#loginbtn");
loginBtn.addEventListener("click",showLoginForm);

let crossBtn = document.querySelector("span");
crossBtn.addEventListener("click",hideLoginForm);


let formbtn=document.querySelector(".form-btn");
formbtn.addEventListener("click",function(e){


    e.preventDefault();
    hideLoginForm();
    loginBtn.style.display="none";
    showToast();

});



let toastbox=document.querySelector(".toast-box");
function showToast(){
    let toast=document.createElement("div");
    toast.classList.add("toast");
    toast.innerHTML=`&#10003;    Successfully Logged In! <div class="toast-close">&#10005;</div>`;
    toastbox.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);

    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());

}
