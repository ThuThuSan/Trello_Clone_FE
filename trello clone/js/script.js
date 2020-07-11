 const EndPoint = "http://localhost:8080";
var lists = []

display();
function display() {
    fetch(endPoint+"/lists")
    .then(response => response.json())
    .then(data => {
        lists = data;
        const listStr = data.map(list => getList(list)).join("") + 
        `
        <div>
            <div class="addAnotherList" onclick = "addNewList()"><button class="anotherList"><i class="fas fa-plus" id="plusIcon"></i>Add another list</button></div>
            <div id="list-input">
                <input type="text" id="newList" placeholder="Enter list title..." autofocus>
                <div>
                    <button href="#" onclick="addList()">Add List</button>
                    <button href="#" onclick="cancel(event)"><i class="fas fa-times"></i></button>
                </div> 
            </div>    
        </div> `

       document.getElementById('container').innerHTML = listStr;

    })
    fetch(endPoint+"/accounts")
    .then(response => response.json())
    .then(data => {
        const accStr = data.map(acc => getMember(acc)).join("");
        document.getElementById('allMem').innerHTML = accStr;
    })
}

// Card
function getCard(card, list) {
    const labelStr = card.labels.map(label => getLabel(label, "")).join("");
    const memberStr = card.members.map(mem => getMember(mem)).join("");
    return `<div id="card"  onclick="showCardClicked(event)" listid="${list.id}" cardid="${card.id}">
    <i class="fas fa-edit"></i>
    ${labelStr}
    <h5 id="card-title">${card.title}</h5>
    <div>
        <div>
            ${card.description ? `<i class="fas fa-bars"></i>` : ``}
            ${card.checklist ? `<i class="fas fa-check-square"></i>` : ``}
        </div>
        <div style="display: flex">${memberStr}</div>
    </div>
</div>`
}
const getMember = (mem) => {
  const names = mem.name.trim().split(" ");
  let initials = names[0][0];
  if(names.length > 1) {
     initials += names[names.length -1][0];
  } else if(names[0].length > 1) {
     initials += names[0][1];
  }
  initials = initials.toUpperCase();
  return `<div class="avatar" onclick="avatarClicked(event)">${initials}</div>`;
};


function getList(list) {
  const cardStr = list.cards.map(c => getCard(c, list)).join("");
  return `
  <div class = "card">
  <div>
      <input type="text" onclick = "editTitle()">${list.title}
      <input type="text" id="listTitle" listid="${list.id}" listpos="${list.position}" value="${list.title}" autofocus>
      button onclick = "listOption(event)"><i class="fas fa-ellipsis-h"></i></button>
  </div>
  <span> ${cardStr} </span>
  <div id="add-card">
      <button id ="addCard"  onclick="addNewCard();"><i class="fas fa-plus" id="fa-plus"></i>Add another Card</button>
      <button id = "briefcase" title = "Create from template"><i class="fas fa-briefcase"></i></button> 
      <div id="card-input">
              <textarea id="newCard" placeholder="Enter a title for this card..." autofocus></textarea>
              <div>
                  <button onclick="addCard(event)" listid="${list.id}">Add Card</button>
                  <button onclick="cancel(event)"><i style="font-size: 20px;" class="fas fa-times"></i></button>
              </div> 
      </div>
  </div>`

  function cancel(e){
    e.target.parentElement.parentElement.parentElement.setAttribute("style", "visibility: hidden;");
}


function avatarClicked(event) {
  event.stopPropagation();
}


  function wrapperScrolled() {
    closeMenu();
    if(addListPopup.style.display === "block") {
      const rect = document.getElementById("add-list-btn").getBoundingClientRect();
      addListPopup.style.top = rect.top + "px";
      addListPopup.style.left = rect.left + "px";
    }
  }

  function closeMenu() {
    if(listMenuPopup.style.display == "block")
      listMenuPopup.style.display = "none";
    if(addListPopup.style.display === "block") {
      toggelAddListPopup(false);
    }
  }

  function fetchData() {
    setLoading(true);
    fetch(END_POINT + "/list")
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        console.log(data);
        lists = data;
        const listStr = data.map(l => getList(l)).join("") + addListBtn;
        document.getElementById("wrapper").innerHTML = listStr;
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  }
  }
  

  const getListAndCardIds = (target) => {
    if(target.getAttribute("card-id")) {
      return [target.getAttribute("list-id"), target.getAttribute("card-id")];
    } else {
      return getListAndCardIds(target.parentElement);
    }
  }
  function addList() {
    const pos=document.getElementById("container").childElementCount;
    const title=document.getElementById("newList").value;
    const data = {
        "title": title,
        "position": pos,
        "status": 1
    }
    fetch(endPoint+"/lists", {
        method: 'post',
        headers: {
            'content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response=> response.json())
    .then(data => {
        console.log(data)
        display();
    })
}

function addCard(e){
  const CardPos=e.target.parentElement.parentElement.parentElement.parentElement.childElementCount-1;
  const CardTit=e.target.parentElement.previousElementSibling.value;
  const listId=e.target.getAttribute("listid");
  const data = {
      "title": CardTit,
      "description": null,
      "due_date": null,
      "position": CardPos,
      "status": 1,
      "list": {
          "id": listId
      }
}
  fetch(endPoint+"/cards", {
      method: 'post',
      headers: {
          'content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response=> response.json())
  .then(data => {
      console.log(data)
      display();
  })
}

function showCardClicked(e) {
  const [listId, cardId] = getListIdAndCardId(e.target)
  const list = lists.find(l => l.id==listId)
  const card = list.cards.find(c => c.id==cardId)
  
  const memberPic = card.members.map(mem => getMember(mem)).join("");
  const label = card.labels.map(lab => getLabel(lab, lab.name)).join("")
  document.getElementById("card-info").innerHTML= `
              <div>
                  <i class="fas fa-money-check"></i>
                  <div>
                      <h1>${card.title}</h1>
                      <p>in list <a href="#" id="parent-list">${list.title}</a></p>
                      <div id="mem-label-wrapper">
                          ${card.members.length!=0 ? `<div id="card-members" style="margin-right: 15px;">
                              <h3>MEMBERS</h3>
                              <div style="display: flex;">
                                  ${memberPic}
                                  <div id="member">
                                      <i style="font-weight: 600;" class="fas fa-plus"></i>
                                  </div>
                              </div>
                              </div>` : ``}
                          ${card.labels.length!=0 ? `<div id="card-labels">
                              <h3>LABELS</h3>
                              <div style="display: flex;">
                                  ${label}
                                  <div>
                                      <i style="font-weight: 600;" class="fas fa-plus"></i>
                                  </div>
                              </div>
                              </div>` : ``}
                      </div>
                  </div>
              </div>
              <div>
                  <i class="fas fa-align-left"></i>
                  <div>
                      <div style="display: flex;"> 
                          <h2>Description</h2>
                          <a href="#">Edit</a>
                      </div>
                      <p>${card.description}</p>
                  </div>
              </div>
              <div>
                  <i class="fas fa-paperclip"></i>
                  <div>
                      <h2>Attachments</h2>
                      <p></p>
                      <a href="#">Add an attachment</a>
                  </div>
              </div>
              <div>
                  <i class="far fa-check-square"></i>
                  <div>
                      <div class="wrapper">
                          <h2>Checklist</h2>
                          <a href="#">Delete</a>
                      </div>
                      <p>${card.checklist}</p>
                  </div>
                  </div>
                  <div>
                      <i class="fas fa-list-ul"></i>
                      <div class="wrapper">
                          <h2>Activity</h2>
                          <a href="#">Show Details</a>
                      </div>
                  </div>
                  <div>
                      <span id="userp""><i class="fas fa-user"></i></span>
                      <input id="comment" type="text" placeholder="Write a comment...">
                  </div>
              </div>`
  document.getElementById("modal").style.visibility="visible";
}

function getLabel(label, n) {
    return `<div id="label" style="background-color: ${label.color}">${n}</div>`
}

function getListIdAndCardId(target) {
    if(target.getAttribute("listid") != null){
        return [target.getAttribute("listid"), target.getAttribute("cardid")]
    }else {
        return getListIdAndCardId(target.parentElement)
    }
}

function hideCard() {
    document.getElementById("modal").style.visibility="hidden";
    display();
}

function updateList(e){
    const id=e.target.getAttribute("listid");
    const pos=e.target.getAttribute("listpos");
    const tit=e.target.value;
    const data = {
            "id": id,
            "title": tit,
            "position": pos,
            "status": 1
    }
    fetch(endPoint+"/lists/"+id, {
        method: 'put',
        headers: {
            'content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response=> response.json())
    .then(data => {
        console.log(data)
        display();
    })
}
function addListClicked(){
    document.getElementById("list-input").style.visibility = 'visible';
}
function addCardClicked(e) {
    e.target.nextElementSibling.nextElementSibling.setAttribute("style", "visibility: visible;")
}
function cancel(e){
    e.target.parentElement.parentElement.parentElement.setAttribute("style", "visibility: hidden;");
}
function editListTitle(e){
    e.target.setAttribute("style","position: relative;")
    e.target.nextElementSibling.setAttribute("style", "visibility: visible;")
    e.target.nextElementSibling.addEventListener("keyup", function(event){
        event.preventDefault();
        if(event.keyCode==13){
            updateList(event);
        }
    })
}


