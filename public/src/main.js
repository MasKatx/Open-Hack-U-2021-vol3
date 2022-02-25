let db = {};
document.addEventListener("DOMContentLoaded", async function () {
    // db = await firebase.firestore();
    vm.myBooksGet();
    if (location.pathname === "/timer.html") {
        vm.timerLoad();
    } else if (location.pathname === "/reading_log.html") {
        vm.bookData();
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
        img: "",
        flg: true,
        myBook: [
            {
                title: "七つの会議",
                author: "池井戸潤",
                img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/4123/9784087454123.jpg?_ex=120x120",
                url: "https://books.rakuten.co.jp/rb/13614117/?scid=af_pc_etc&sc2id=af_101_0_0",
                isbn: "9784087454123"
            },{
                title: "新・明解Java入門 第2版",
                author: "柴田望洋",
                img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/6015/9784815606015.jpg?_ex=120x120",
                url: "https://books.rakuten.co.jp/rb/16376516/?scid=af_pc_etc&sc2id=af_101_0_0",
                isbn: "9784815606015"
            }
        ],
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
            // return;
            this.bookSearchResult = [];
            const sort = $("option:selected").val();
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&sort=${sort}&applicationId=1088025467655525347&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const urlTmp = url;
            url += vm.title != "" ? `&title=${vm.title}` : "";
            url += vm.author != "" ? `&author=${vm.author}` : "";
            url += vm.publisher != "" ? `&publisherName=${vm.publisher}` : "";
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
                        publisher: `出版社 : ${item.publisherName}`,
                        img: item.mediumImageUrl.split("?")[0],
                        url: item.affiliateUrl,
                        price: `価格 : ${item.itemPrice}円(税込)`,
                        isbn: item.isbn,
                    }
                );
            }
        },
        myBooksGet: async function () {
            return;
            this.myBook = [];
            const userName = "ishida";
            const res = await db.collection(`users/user/${userName}`).get();
            res.forEach((postDoc) => {
                const dic = postDoc.data();
                vm.myBook.push({
                    title: dic.title,
                    author: `著者 : ${dic.author}`,
                    publisher: `出版社 : ${dic.publisher}`,
                    img: dic.img,
                    url: dic.url,
                    isbn: dic.isbn,
                });
            });
        },
        myBookAdd: async function (isbn = 0) {
            return;
            if (isbn === 0) {
                if (this.isbn.length != 13) {
                    alert("13桁のISBN(バーコードの番号)を入力してください");
                    return;
                }
                isbn = this.isbn;
            }
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${isbn}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const apiRes = await fetch(url);
            const resJson = await apiRes.json();
            this.flg = resJson.Items.length > 0;
            if (resJson.Items.length == 0) {
                this.bookSearchResult.push({ title: "見つかりませんでした" });
                return;
            }
            const item = resJson.Items[0].Item;
            const addData = {
                title: item.title.replace("　", " "),
                author: item.author,
                publisher: item.publisherName,
                img: item.mediumImageUrl.split("?")[0],
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
                    publisher: dic.publisher,
                    img: dic.img,
                    url: dic.url,
                    isbn: dic.isbn,
                    readTime: dic.readTime,
                });
            });
            this.myBooksGet();
            $("#addAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },
        bookDelete: async function (isbn) {
            return;
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
            window.location.href = `https://open-hack-u-2021.web.app/timer.html?isbn=${isbn}`;
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
                    vm.ss = String(Math.floor(second % 60)).padStart(2, "0");
                    vm.mm = String(Math.floor(second / 60) % 60).padStart(2, "0");
                    vm.hh = String(Math.floor(Math.floor(second / 60) / 60) % 60).padStart(2, "0");
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
            return;
            const res = await db.doc(`users/user/${userName}/${isbn}`).get();
            const resData = res.data();
            const readTime = Math.floor((time + resData.readTime) * 10) / 10;
            await db.doc(`users/user/${userName}/${isbn}`).update({ readTime: readTime });
            history.back();
        },
        bookRecord: function (isbn) {
            window.location.href = `https://open-hack-u-2021.web.app/reading_log.html?isbn=${isbn}`;
        },
        bookData: async function () {
            return;
            const isbn = location.search.split("=")[1];
            const userName = "ishida";
            const res = await db.doc(`users/user/${userName}/${isbn}`).get();
            const resData = res.data();
            vm.title = resData.title;
            vm.author = `著者 : ${resData.author}`;
            vm.bigImg = resData.img;
            vm.publisher = `出版社 : ${resData.publisher}`;
            vm.public = resData.publicReview;
            vm.url = resData.url;
            vm.private = resData.privateReview;
            vm.lastReadDate = resData.lastReadDate;
            vm.hh = Math.floor(Math.floor(resData.readTime / 60) / 60) % 60;
            vm.mm = Math.floor(resData.readTime / 60) % 60;
            vm.ss = Math.floor(resData.readTime % 60);
        },

        bookDataUpdate: async function () {
            const isbn = location.search.split("=")[1];
            const userName = "ishida";
            const res = await db.doc(`users/user/${userName}/${isbn}`).get();
            const resData = res.data();
            const updateData = {
                publicReview: vm.public,
                privateReview: vm.private,
            };
            await db.doc(`users/user/${userName}/${isbn}`).update(updateData);
            $("#updateAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },
    },
});