const urlInfo = new URLSearchParams(window.location.search);
const postId = urlInfo.get("id");

const messageElement = document.querySelector("#message");
const countElement = document.querySelector("#count");
const postBodyElement = document.querySelector(".body");
const postTitleElement = document.querySelector(".title");
const commentsElement = document.querySelector(".comments");
const commentForm = document.querySelector("#newComment");
const userId = 2;
renderElements();

async function getInfo(){
    try{
       const [postResponse, commentsResponse] = await Promise.all([
        fetch(`https://dummyjson.com/posts/${postId}`), 
        fetch(`https://dummyjson.com/comments/post/${postId}`)
        ]); 
        if(!postResponse.ok){
            throw new Error(console.log(postResponse.status))
        }
        if(!commentsResponse.ok){
            throw new Error(console.log(commentsResponse.status))
        }
        const post = await postResponse.json();
        const data = await commentsResponse.json();
        const comments = data.comments;
        return {post, comments};
    }catch(error){
        showMessage("cant fetch post data");
        console.log(error)
    }
    
}

async function renderElements(){
    const info = await getInfo();
    const post = info.post;
    const comments = info.comments;
    postBodyElement.textContent = post.body;
    postTitleElement.textContent = post.title;

    comments.forEach(comment => {
        renderComment(comment);
        
    });
    countElement.textContent = comments.length;
    commentForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        const formData = new FormData(commentForm);
        const commentText = formData.get("newComment")
        const newComment = await createComment(commentText, post.id);
        comments.push(newComment);
        countElement.textContent = comments.length;
    })

}
function renderComment(comment){
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment")

    commentElement.innerHTML =`
            <h4>${comment.user.fullName}</h4>
            <p>${comment.body}</p>
            <p id = "likes">Likes ${comment.likes}</p>
        
    `;
    commentsElement.appendChild(commentElement);
}

async function createComment(text, postId){
    try{
        const response = await fetch(`https://dummyjson.com/comments/add`, 
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body:JSON.stringify({
                    body: text,
                    postId: postId,
                    userId: userId 
                })
            }
        );
        if(!response.ok){
            throw new Error(response.status);
        }
        const newComment = await response.json();
        if(!newComment.likes){
            newComment.likes = 0;
        }
        renderComment(newComment);
        return newComment;
    }catch(error){
        showMessage("cant add comment");
        console.log(error);
    }
}
function showMessage(message){
    messageElement.textContent = message;
}
