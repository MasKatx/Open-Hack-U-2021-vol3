let db = {};
document.addEventListener("DOMContentLoaded", async function () {
    db = await firebase.firestore();
    vm.myBooksGet();
    if (location.pathname == "/timer.html") {
        vm.timerLoad();
    }
});

const vm = new Vue({
    el: "#main",
    data: {
        bookSearchResult: [],
        title: "",
        author: "",
        publisher: "",
        isbn: "",
        flg: true,
        myBook: [],
        startTime: 0,
        endTime: 0,
        tmpTime: 0,
        tmpStartTime: 0,
        tmpEndTime: 0,
        timeCount: null,
        hh: 0,
        mm: 0,
        ss: 0,
        pause: "一時停止",
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
            if (url === urlTmp) {
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
                        isbn: item.isbn,
                    }
                );
            }
        },

        myBooksGet: async function () {
            this.myBook = [];
            const userName = "ishida";
            // users(c) -> user(d) -> ishida(c) -> book(d)
            // await db.doc(`users/user/${userName}/${bookIsbn}`).set({
            //     title: "this is title",
            //     author: "mr.k",
            //     img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0542/9784088920542_1_4.jpg?_ex=120x120",
            //     url: "https://books.rakuten.co.jp/rb/16795162/?scid=af_pc_etc&sc2id=af_101_0_0",
            // });
            const testLog = await db.collection(`users/user/${userName}`).get();
            // console.log(testLog.docs.map(postDoc => postDoc.id))
            testLog.forEach((postDoc) => {
                const dic = postDoc.data();
                this.myBook.push({ title: dic.title, author: dic.author, img: dic.img, url: dic.url, isbn: dic.isbn });
                // console.log(postDoc.id, ' => ', dic);
            });
        },

        myBookAdd: async function (isbn = 0) {
            if (isbn === 0) {
                if (this.isbn.length != 13) {
                    alert("13桁のISBN(バーコードの番号)を入力してください");
                    return;
                }
                isbn = this.isbn;
            }
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${isbn}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const res = await fetch(url);
            const resJson = await res.json();
            this.flg = resJson.Items.length > 0;
            if (resJson.Items.length == 0) {
                this.bookSearchResult.push({ title: "見つかりませんでした" });
                return;
            }
            const item = resJson.Items[0].Item;
            console.log(item.isbn);
            const addData = {
                title: item.title.replace("　", " "),
                author: item.author,
                img: item.mediumImageUrl,
                url: item.affiliateUrl,
                isbn: item.isbn,
                readTime: 0,
            };
            const bookIsbn = item.isbn;
            const userName = "ishida";
            await db.doc(`users/user/${userName}/${bookIsbn}`).set(addData);
            const testLog = await db.collection(`users/user/${userName}`).get();
            testLog.forEach((postDoc) => {
                const dic = postDoc.data();
                this.myBook.push({
                    title: dic.title,
                    author: dic.author,
                    img: dic.img,
                    url: dic.url,
                    isbn: dic.isbn,
                    readTime: dic.readTime,
                });
                console.log(postDoc.id, ' => ', dic);
            });
            this.myBooksGet();
            $("#addAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },

        bookDelete: async function (isbn) {
            if (!window.confirm("削除しますか？")) {
                return;
            }
            const userName = "ishida";
            await db.doc(`users/user/${userName}/${isbn}`).delete();
            this.myBooksGet();
            $("#deleteAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },

        read: function (isbn) {
            window.location.href = `http://localhost:5000/timer.html?isbn=${isbn}`;
        },

        timerLoad: function () {
            this.startTime = Date.now();
            this.timeCount = setInterval(function () {
                let second = (Date.now() - vm.startTime - vm.tmpTime) / 1000;
                vm.ss = Math.floor(second % 60);
                vm.mm = Math.floor(second / 60) % 60;
                vm.hh = Math.floor(Math.floor(second / 60) / 60) % 60;
            }, 1000);
        },

        timerPause: function () {
            if (this.pause === "一時停止") {
                this.pause = "再開";
                this.tmpStartTime = Date.now();
                clearInterval(this.timeCount);
            } else {
                this.pause = "一時停止";
                this.tmpEndTime = Date.now();
                this.tmpTime += this.tmpEndTime - this.tmpStartTime;
                this.timeCount = setInterval(function () {
                    let second = (Date.now() - vm.startTime - vm.tmpTime) / 1000;
                    vm.ss = Math.floor(second % 60);
                    vm.mm = Math.floor(second / 60) % 60;
                    vm.hh = Math.floor(Math.floor(second / 60) / 60) % 60;
                }, 1000);
            }
        },

        timerEnd: async function () {
            if (this.pause === "再開") {
                this.tmpTime += Date.now() - this.tmpStartTime;
            }
            this.endTime = Date.now();
            clearInterval(this.timeCount);
            const time = (this.endTime - this.startTime - this.tmpTime) / 1000;

            const isbn = location.search.split("=")[1];
            const userName = "ishida";
            const res = await db.doc(`users/user/${userName}/${isbn}`).get();
            const resData = res.data();
            const readTime = time + resData.readTime;
            await db.doc(`users/user/${userName}/${isbn}`).update({readTime: readTime});
            history.back();
        },

        bookRecord: function (isbn) {
            window.location.href = `http://localhost:5000/reading_log.html?isbn=${isbn}`;
        },
    }
})