let db = {};
document.addEventListener("DOMContentLoaded", () => db = firebase.firestore());

$("#main").on("click", async function () {
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

const vue = new Vue({
    el: "#main",
    data: {
        bookSearchResult: [],
        title: "",
        author: "",
        publisher: "",
        isbn: "",
        flg: true,
    },
    methods: {
        bookSearch: async function () {
            this.bookSearchResult = [];
            const sort = $("option:selected").val();
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&sort=${sort}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const urlTmp = url;
            url += this.title != "" ? `&title=${this.title}` : "";
            url += this.author != "" ? `&author=${this.author}` : "";
            url += this.publisher != "" ? `&publisherName=${this.publisher}` : "";
            // url += this.isbn != "" ? `&isbn=${this.isbn}` : "";
            if (url === urlTmp){
                alert("入力してください");
                return;
            }
            const res = await fetch(url);
            const resJson = await res.json();
            this.flg = resJson.Items.length > 0;
            if (resJson.Items.length == 0) {
                this.bookSearchResult.push({ title: "見つかりませんでした" });
                return;
            }
            for (let i = 0; i < resJson.Items.length; i++) {
                let item = resJson.Items[i].Item;
                this.bookSearchResult.push(
                    {
                        title: item.title.replace("　", " "),
                        author: `著者 : ${item.author}`,
                        img: item.mediumImageUrl,
                        url: item.affiliateUrl,
                        price: `価格 : ${item.itemPrice}円(税込)`,
                    }
                );
            }
        }
    }
})