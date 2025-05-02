function fingerprint() {
    let username = document.querySelector("#username");
    let password = document.querySelector("#password");
    if(username.value.trim() === "") 
    {
        alert("Fill out the Email");
    }
    else if(password.value.trim() === "") { 
        
        alert("Fill out the password")
    }
    else if(username.value.trim() !== "" || password.value.trim() !== "") {
        window.location.href = "../../Front/index.html";

    }
}
function user_panel() {
    window.location.href = "../../Panel2/Component/Registration/index.html";
}