const postElement = document.querySelector("#postDisplay");
const messageElement = document.querySelector("#message");
const commentsElement = document.querySelector("#commentsDisplay");
const commentForm = document.querySelector("#commentForm");
const userId = 2;


renderAll();


function showMessage(message){
    messageElement.textContent = message;
}
async function renderAll(){
    
    const urlInfo = new URLSearchParams(window.location.search);
    const postId = urlInfo.get("id");
    try{
        const [postResponse, commentsResponse] = await Promise.all(
        [
            fetch(`https://dummyjson.com/posts/${postId}`),
            fetch(`https://dummyjson.com/posts/${postId}/comments`)
        ]);
        if(!postResponse.ok || !commentsResponse.ok){
            throw new Error(postResponse.status, commentsResponse.status);
        }
        const post = await postResponse.json();
        const commentsdata = await commentsResponse.json();
        const comments = commentsdata.comments;
        displayPost(post);
        displayComments(comments);
        addComment(post, comments);
        
    }catch(error){
        showMessage("Unable to fetch post information...")
        console.log(error)
    }

}

function displayPost(post){
    postElement.innerHTML = `
    <h1>Post</h1>
    <p>User number: ${post.userId}</p>
    <h3>${post.title}</h3>
    <p>${post.body}</p>
    <p>Views: ${post.views}</p>
    <p>Tags: ${post.tags}</p>
    <p>Likes: ${post.reactions.likes} Dislikes: ${post.reactions.dislikes} </p>
    `;
}

function displayComments(comments){
    //post används i "addComment" som i 
    commentsElement.innerHTML = 
    `
    <h2>Comments</h2>
    `;
     comments.forEach(comment => {
        if(!comment.likes){
            comment.likes = 0;
        }
        const commentElement = document.createElement("div");
        commentElement.innerHTML = 
        `
        <h4>${comment.user.fullName}</h4>
        <p>${comment.body}</p>
        <p>Likes: ${comment.likes}</p>
        `;
        commentsElement.appendChild(commentElement);
    })

}

async function addComment(post, comments){
    
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(commentForm);
        const body = formData.get("newCommentText");
        
        try{
            const response = await fetch(`https://dummyjson.com/comments/add`, 
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "accept": "application/json"
                    },
                    body:JSON.stringify({
                        body: body,
                        postId: post.id,
                        userId: userId
                    })
                });
            if(!response.ok){
                throw new Error(response.status)
            }
            const newComment = await response.json()
            comments.push(newComment);
            console.log(newComment);
            displayComments(comments);
        }catch(error){
            showMessage("unable to add comment");
            console.log(error);
        }
    })

}