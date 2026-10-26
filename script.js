const catalog = document.querySelector("#catalog");
const messageElement = document.querySelector("#message");
const searchPost = document.querySelector("#searchPost");
const sortCatalog = document.querySelector("#sortPosts");
const countElement = document.querySelector("#postCount");
const filter = 
    {
    searchText: "",
    searchTags: ""
    };


renderPosts();

function showMessage(message){
    messageElement.textContent = message;
}
async function renderPosts(){
    const postInfo = await getPostsInfo();
    const posts = postInfo.posts;
    const comments = postInfo.comments;
    
    posts.forEach((post) => {
        renderPostElements(post, posts, comments);
        countElement.textContent = posts.length;
    });

    searchPost.addEventListener("input", (e) => {
        filter.searchText = e.target.value;
        filterPosts(posts, comments, filter);
    })
    sortCatalog.addEventListener("change", (e) => {
        catalog.innerHTML = "";
        sortPosts(e.target.value, comments);
    })
    

}
async function getPostsInfo(){
    try{
        showMessage("Loading posts...")
        const [postResponse, commentsResponse] = await Promise.all([
            fetch(`https://dummyjson.com/posts?limit=15`), 
            fetch(`https://dummyjson.com/comments?limit=15`)
        ]);
        if(!postResponse.ok){
            throw new Error(console.log(postResponse.statusText));
        }
        if(!commentsResponse.ok){
            throw new Error(console.log(commentsResponse.statusText));
        }
        const postData = await postResponse.json();
        const commentsData = await commentsResponse.json();
        const posts = postData.posts;
        const comments = commentsData.comments;
        showMessage("");
        return {posts, comments};
    }catch(error){
        showMessage("Unable to load posts..");
        console.log(error)
    }
    
}

async function renderPostElements(post, posts, comments){
    const postComments = comments.filter(comment => comment.PostId === post.id);
    const postElement = document.createElement("div");
    postElement.classList.add("post-card");
    postElement.innerHTML = `
        <h4>${post.title}</h4>
                <p>${post.body}</p>
                <div class ="card-bottom-panel">
                    <p class="card-stats">
                        <span>views: ${post.views}</span> 
                        <span>Likes: ${post.reactions.likes}</span>
                        <span>Comments: ${postComments.length}</span>
                    </p>

                    <div class="buttons">
                        <button class="button" id = "editBtn">Edit</button>
                        <button class="button delete" id = "deleteBtn">Delete</button> 
                    </div>
                        <div class ="editingContainer hidden">
                            <form class="editForm">
                                <input type="text" name="newTitle" >
                                <textarea name="newBody"></textarea>
                                <button type="submit" class="button">Submit</button>
                            </form>
                        </div>
                        
                            
                        
                </div>
    `;
    catalog.appendChild(postElement);

    const deleteBtn = postElement.querySelector(`#deleteBtn`);
    const editBtn = postElement.querySelector(`#editBtn`);
    const editElement = postElement.querySelector(".editingContainer")
    const editForm = postElement.querySelector("form");
    const titleElement = postElement.querySelector("h4");
    const bodyElement = postElement.querySelector("p");

    deleteBtn.addEventListener("click", async()=>{

        const deletedPost = await deletePost(post);
        const deleteIndex = posts.findIndex(post => post.id === deletedPost.id)
        posts.splice(deleteIndex, 1);
        postElement.remove();
        countElement.textContent = posts.length;
        showMessage("Post deleted")
        
    });
    
    editBtn.addEventListener("click", () => {
        editElement.classList.toggle("hidden");
    });
    editForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const {newTitle, newBody} = Object.fromEntries(formData);
        const editedPost = await editPost(newTitle, newBody, post);
        if(editedPost.title && editedPost.body){
            const replaceIndex = posts.findIndex(anyPost => anyPost.id === editedPost.id)
            posts.splice(replaceIndex, 1, editedPost);
        
            postElement.remove();
            renderPostElements(editedPost, posts, comments);
            showMessage("Post edited");
        }else{
            showMessage("Title and body required..");
        }
    });
    titleElement.addEventListener("click", () => {
        window.location.href = `post.html?id=${post.id}`;
    });



}
async function deletePost(post){
    try{
        const response = await fetch(`https://dummyjson.com/posts/${post.id}`, {
            method: "DELETE"
        })
        if(!response.ok){
            throw new Error(console.log(response.status))
        }
        const deletedPost = await response.json();
        
        // console.log(posts);
        return deletedPost;
    }catch(error){
        showMessage("cant delete post");
        console.log(error)
    }
}

async function editPost(newTitle, newBody, post){
    try{
        const response = await fetch(`https://dummyjson.com/posts/${post.id}`, {
            method: "PUT",
            headers:{
                "content-type": "application/json",
            },
            body:JSON.stringify({
                title: newTitle,
                body: newBody
            })
        });
        if(!response.ok){
            throw new Error(console.log(response.status))
        }
        const updatedPost = await response.json();
        return updatedPost;
    }catch(error){
        showMessage("cant edit post");
        console.log(error);
    }
}

function filterPosts(posts, comments, filter){
    
    const filteredPosts = posts.filter(post => {
        const textMatch = post.title.toLowerCase().trim().includes(filter.searchText.toLowerCase().trim()) || !filter.searchText;
        return textMatch;
    });
    catalog.innerHTML = "";
    filteredPosts.forEach((post) => {
        renderPostElements(post, posts, comments)
    });
}
async function sortPosts(option, comments){
    switch(option){
        case "sortByViews":
            try{
                const response = await fetch(`https://dummyjson.com/posts?limit=15&&sortBy=views&order=desc`)
                if(!response.ok){
                    throw new Error(console.log(response.status))
                }
                const data = await response.json();
                const sortedPosts = data.posts;

                sortedPosts.forEach((post) => {
                    renderPostElements(post, sortedPosts, comments);
                });
            }catch(error){showMessage(`cant sort by "most viewed"`);
                console.log(error)
            }
        break;

        case "sortByLikes":
           try{
                showMessage("Sorting posts...")
                const response = await fetch(`https://dummyjson.com/posts?limit=15&&sortBy=reactions.likes&order=desc`)
                if(!response.ok){
                    throw new Error(console.log(response.status))
                }
                const data = await response.json();
                const sortedPosts = data.posts;

                sortedPosts.forEach((post) => {
                    renderPostElements(post, sortedPosts, comments);
                });
            }catch(error){showMessage(`cant sort by "Most liked"`);
                console.log(error)
            } 
        break;

        default:
            try{
                showMessage("Sorting posts...")
                const response = await fetch(`https://dummyjson.com/posts?limit=15`)
                if(!response.ok){
                    throw new Error(console.log(response.status))
                }
                const data = await response.json();
                const sortedPosts = data.posts;

                sortedPosts.forEach((post) => {
                    renderPostElements(post, sortedPosts, comments);
                });
            }catch(error){showMessage(`cant sort by "First added"`);
                console.log(error)
            }
    }
}