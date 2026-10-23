//FRÅGA ALEX
    //Ska man kunna filtrera mer än 1 tag åt gången?
const displayElement = document.querySelector("#postsDisplay");
const messageElement = document.querySelector("#message");
const searchPost = document.querySelector("#searchPost");
const searchTags = document.querySelector("#searchTags");
let posts;
const filter = 
{
    titleSearch: "",
    tagsSearch: ""
};

function enableFilters(posts){
    searchPost.addEventListener("input", (e) => {
            filter.titleSearch = e.target.value;
            filteredPosts(filter, posts);
    });
    searchTags.addEventListener("input", (e) => {
        filter.tagsSearch = e.target.value;
        filteredPosts(filter, posts);
    })
}
function filteredPosts(filter, posts){
    const updatedPosts = posts.filter(post => {
        const matchText = post.title.toLowerCase().trim().includes(filter.titleSearch.toLowerCase().trim())  || !filter.titleSearch;
        const matchTags = post.tags.includes(filter.tagsSearch.toLowerCase().trim()) || !filter.tagsSearch;
        
        return matchText && matchTags;
    });
    console.log(updatedPosts);
    displayElement.innerHTML = "";
    updatedPosts.forEach(post => {
        renderPostElements(post, posts);
       
    });

}
//RUN IT!
renderAll();

//FUNCTIONS
function showMessage(message){
    messageElement.textContent = message;
}
async function renderAll(){
    
    try{
        const response = await fetch(`https://dummyjson.com/posts?limit=10`);
        if(!response.ok){
            throw new Error(response.status);
        }
        data = await response.json();
        posts = data.posts
    }catch(error){
        showMessage("Blogg inlägg ej tillgängliga")
    };
    renderPosts(posts);
    enableFilters(posts);
}

function renderPosts(posts){
    posts.forEach(post => {
        renderPostElements(post, posts);
       
    })
    

}
async function renderPostElements(post, posts){
    const postElement = document.createElement("div");
    const titleElement = document.createElement("h4");
    const bodyElement = document.createElement("p");
    const viewsElement = document.createElement("p");
    const tagsElement = document.createElement("p");
    const editField = createEditField(post);
    const editBtn = createEditBtn(editField);
    const removeBtn = await createRemoveBtn(post, posts,postElement);
    if(!post.views){
        post.views = 0;
    }
    titleElement.textContent = post.title;
    bodyElement.textContent = post.body;
    viewsElement.textContent = `Views: ${post.views}`;
    tagsElement.textContent = post.tags

    postElement.appendChild(titleElement);
    postElement.appendChild(viewsElement);
    postElement.appendChild(bodyElement);
    postElement.appendChild(editField);
    postElement.appendChild(editBtn);
    postElement.appendChild(removeBtn);
    postElement.appendChild(tagsElement);
    displayElement.appendChild(postElement);//härifrån är editForm tillgänglig
    

    titleElement.addEventListener("click", () => {
        postPage(post);
    });
    
    editPost(post, posts);
      //lyssnar på form, patchar till api, uppdaterar posts och kör renderPostElements
    

}

async function createRemoveBtn(post, posts,postElement){
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";

    removeBtn.addEventListener("click", async () => {
        
        try{
            const response = await fetch(`https://dummyjson.com/posts/${post.id}`,
                {
                    method: "DELETE"
                }
            );
            if(!response.ok){
                throw new Error(response.status)
            }
            const deletedPost = await response.json();
            
            const deletedPostIndex = posts.findIndex(post => post.id === deletedPost.id);
            posts.splice(deletedPostIndex, 1);
            postElement.remove();
        }catch(error){
            showMessage("unable to delete post...");
            console.log(error);
        }
    });
    
    return removeBtn;
}


function createEditBtn(editField){
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", () => {
        editField.classList.toggle("hidden");
    })
    return editBtn;
}

function createEditField(post){
    const editField = document.createElement("div");
    editField.classList.add("hidden");
    editField.innerHTML =`
        <form id ="editForm${post.id}">
        <label> Title
            <input type = "text" id = "editTitle${post.id}" name = "editedTitle">
        </label>
        <br>
        <label> Content
            <textarea id = "editBody${post.id}" name = "editedBody"></textarea>
        </label>
        <br>
        <button type = "submit">Submit</button>
        
    </form>
    `;
    
    //stoppa in title och body i fälten
    return editField;
    
}
async function editPost(post, posts){
    //hur ska jag komma runt att jag behöver post för den här funktionen
    //behöver rendera posts igen efter fetch
    const editForm = document.querySelector(`#editForm${post.id}`);
    const titleInput = document.querySelector(`#editTitle${post.id}`);
    const bodyInput = document.querySelector(`#editBody${post.id}`);
    titleInput.value = post.title;
    bodyInput.value = post.body
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(editForm);
        const {editedTitle, editedBody} = Object.fromEntries(formData);

        try{
            const response = await fetch(`https://dummyjson.com/posts/${post.id}`, 
                {
                    method: "PATCH",
                    headers:{
                        "content-type": "application/json"
                    },
                    body:JSON.stringify({
                        title: editedTitle,
                        body: editedBody
                    })
                }
            );
            if(!response.ok){
                throw new Error(console.log(response.status))
            }
            const editedPost = await response.json();
            const replaceIndex = posts.indexOf(post);
            posts.splice(replaceIndex, 1, editedPost);
            console.log(editedPost)
            displayElement.innerHTML = "";
            posts.forEach(post => {
        renderPostElements(post, posts);
       
    })
        }catch(error){
            showMessage("Unable to edit post...")
            console.log(error)
        }
        
    })

   
}

function postPage(post){
   
    window.location.href = `post.html?id=${post.id}`
}