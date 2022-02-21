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
        list: [],
        title: "",
        author: "",
        publisher: "",
        isbn: "",
        flg: true,
    },
    methods: {
        bookSearch: async function () {
            this.list = [];
            const sort = $("option:selected").val();
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&sort=${sort}&applicationId=1088025467655525347&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const urlTmp = url;
            url += this.title != "" ? `&title=${this.title}` : "";
            url += this.author != "" ? `&author=${this.author}` : "";
            url += this.publisher != "" ? `&publisherName=${this.publisher}` : "";
            url += this.isbn != "" ? `&isbn=${this.isbn}` : "";
            if (url === urlTmp){
                return;
            }
            const res = await fetch(url);
            const resJson = await res.json();
            this.flg = resJson.Items.length > 0;
            if (resJson.Items.length == 0) {
                this.list.push({ title: "見つかりませんでした" });
                return;
            }
            for (let i = 0; i < resJson.Items.length; i++) {
                this.list.push(
                    {
                        title: resJson.Items[i].Item.title,
                        author: `著者 : ${resJson.Items[i].Item.author}`,
                        img: resJson.Items[i].Item.mediumImageUrl,
                        url: resJson.Items[i].Item.affiliateUrl,
                        price: `価格 : ${resJson.Items[i].Item.itemPrice}円(税込)`,
                    }
                );
            }
        }
    }
})