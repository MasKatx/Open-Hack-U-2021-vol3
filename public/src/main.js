let db = {};
document.addEventListener("DOMContentLoaded", () => db = firebase.firestore());

$("#main").on("click", async function() {
    const setData = {
        public_review: "hello",
        private_review: "firebase"
    };
    const userName = "ishida";
    const bookName = "book"
    // db.collection(`users/${userName}/books`).doc(`${bookName}`).set(setData);
    // const testLog = db.collection(`users/${userName}/books`).doc(`${bookName}`);
    // const log = await testLog.get();
    // console.log(log.data());
});

const vue =  new Vue({
    el: "#main",
    data: {
        list: [],
    },
    methods: {
        get: async function(){
            this.list = [];
            const txt = $("#txt").val();
            const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&title=${txt}&applicationId=1088025467655525347`;
            const res = await fetch(url);
            const rres = await res.json();
            for (let i = 0; i < rres["Items"].length; i++) {
                this.list.push({title: rres["Items"][i]["Item"]["title"], author: rres["Items"][i]["Item"]["author"]});
            }
            console.log(this.list)
            console.log(rres);
        }
    }
})