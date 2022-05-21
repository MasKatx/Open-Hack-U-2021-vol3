let db = {};
let uid = "";
document.addEventListener("DOMContentLoaded", async function () {
    db = await firebase.firestore();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (location.pathname === "/login.html" || location.pathname === "/signup.html") {
                window.location.href = "/";
                return;
            }
            uid = user.uid;
            vm.myBooksGet();
        } else {
            if (location.pathname !== "/login.html" && location.pathname !== "/signup.html"){
                window.location.href = "/login.html";
                return;
            }
        }
    });
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
        bigImg: "",
        public: "",
        private: "",
        lastReadDate: "None",
        flg: true,
        myBook: [],
        startTime: 0,
        endTime: 0,
        tmpTime: 0,
        tmpStartTime: 0,
        tmpEndTime: 0,
        timeCount: null,
        hh: "00",
        mm: "00",
        ss: "00",
        pause: "一時停止",
    },
    methods: {
        signup: async function () {
            const mail = $("#mail").val();
            const password = $("#pass").val();
            await firebase.auth().createUserWithEmailAndPassword(mail, password).then(() => {
                window.location.href = "/";
            });
        },

        login: async function () {
            const mail = $("#mail").val();
            const password = $("#pass").val();
            await firebase.auth().signInWithEmailAndPassword(mail, password).then(() => {
                window.location.href = "/";
            });
        },

        logout: function () {
            if (!window.confirm("ログアウトしますか？")){
                return;
            }
            firebase.auth().signOut().then(() => {
                window.location.href = "/login.html";
            });
        },

        bookSearch: async function () {
            vm.bookSearchResult = [];
            const sort = $("option:selected").val();
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&sort=${sort}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const urlTmp = url;
            url += vm.title !== "" ? `&title=${vm.title}` : "";
            url += vm.author !== "" ? `&author=${vm.author}` : "";
            url += vm.publisher !== "" ? `&publisherName=${vm.publisher}` : "";
            if (url === urlTmp) {
                alert("入力してください");
                return;
            }
            const res = await fetch(url);
            const resJson = await res.json();
            vm.flg = resJson.Items.length > 0;
            if (resJson.Items.length === 0) {
                vm.bookSearchResult.push({ title: "見つかりませんでした" });
                return;
            }
            for (let i = 0; i < resJson.Items.length; i++) {
                let item = resJson.Items[i].Item;
                vm.bookSearchResult.push(
                    {
                        title: item.title.replace("　", " "),
                        author: `著者 : ${item.author}`,
                        publisher: `出版社 : ${item.publisherName !== "" ? item.publisherName : "データがありません"}`,
                        img: item.mediumImageUrl.split("?")[0],
                        url: item.affiliateUrl,
                        price: `価格 : ${item.itemPrice}円(税込)`,
                        isbn: item.isbn,
                    }
                );
            }
        },

        myBooksGet: async function () {
            vm.myBook = [];
            const res = await db.collection(`readNote/users/${uid}`).get();
            res.forEach((postDoc) => {
                const dic = postDoc.data();
                vm.myBook.push({
                    title: dic.title,
                    author: `著者 : ${dic.author}`,
                    publisher: `出版社 : ${dic.publisher !== "" ? dic.publisher : "データがありません"}`,
                    img: dic.img,
                    url: dic.url,
                    isbn: dic.isbn,
                });
            });
        },

        myBookAdd: async function (isbn = 0) {
            if (isbn === 0) {
                if (vm.isbn.length !== 13) {
                    alert("13桁のISBN(バーコードの番号)を入力してください");
                    return;
                }
                isbn = vm.isbn;
            }
            let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${isbn}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
            const apiRes = await fetch(url);
            const resJson = await apiRes.json();
            if (resJson.Items.length === 0) {
                if (location.pathname === "/index.html") {
                    alert("見つかりませんでした");
                    return;
                }
                vm.flg = resJson.Items.length > 0;
                vm.bookSearchResult.push({ title: "見つかりませんでした" });
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
                publicReview: "",
                privateReview: "",
                lastReadDate: "None",
            };
            const bookIsbn = item.isbn;
            const checkLog = await db.doc(`readNote/users/${uid}/${isbn}`).get();
            if (checkLog.data() !== undefined) {
                alert("すでに追加されています");
                return;
            }
            await db.doc(`readNote/users/${uid}/${bookIsbn}`).set(addData);
            const testLog = await db.collection(`readNote/users/${uid}`).get();
            testLog.forEach((postDoc) => {
                const dic = postDoc.data();
                vm.myBook.push({
                    title: dic.title,
                    author: dic.author,
                    publisher: dic.publisher,
                    img: dic.img,
                    url: dic.url,
                    isbn: dic.isbn,
                    readTime: dic.readTime,
                    lastReadDate: dic.lastReadDate,
                });
            });
            vm.myBooksGet();
            $("#addAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },

        bookDelete: async function (isbn) {
            if (!window.confirm("削除しますか？")) {
                return;
            }
            await db.doc(`readNote/users/${uid}/${isbn}`).delete();
            vm.myBooksGet();
            $("#deleteAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },

        read: function (isbn) {
            window.location.href = `https://open-hack-u-2021.web.app/timer.html?isbn=${isbn}`;
        },

        timerLoad: function () {
            vm.startTime = Date.now();
            vm.timeCount = setInterval(function () {
                let second = (Date.now() - vm.startTime - vm.tmpTime) / 1000;
                vm.ss = String(Math.floor(second % 60)).padStart(2, "0");
                vm.mm = String(Math.floor(second / 60) % 60).padStart(2, "0");
                vm.hh = String(Math.floor(Math.floor(second / 60) / 60) % 60).padStart(2, "0");
            }, 1000);
        },

        timerPause: function () {
            if (vm.pause === "一時停止") {
                vm.pause = "再開";
                vm.tmpStartTime = Date.now();
                clearInterval(vm.timeCount);
            } else {
                vm.pause = "一時停止";
                vm.tmpEndTime = Date.now();
                vm.tmpTime += vm.tmpEndTime - vm.tmpStartTime;
                vm.timeCount = setInterval(function () {
                    let second = (Date.now() - vm.startTime - vm.tmpTime) / 1000;
                    vm.ss = String(Math.floor(second % 60)).padStart(2, "0");
                    vm.mm = String(Math.floor(second / 60) % 60).padStart(2, "0");
                    vm.hh = String(Math.floor(Math.floor(second / 60) / 60) % 60).padStart(2, "0");
                }, 1000);
            }
        },

        timerEnd: async function () {
            if (vm.pause === "再開") {
                vm.tmpTime += Date.now() - vm.tmpStartTime;
            }
            vm.endTime = Date.now();
            clearInterval(vm.timeCount);
            const time = (vm.endTime - vm.startTime - vm.tmpTime) / 1000;

            const isbn = location.search.split("=")[1];
            const res = await db.doc(`readNote/users/${uid}/${isbn}`).get();
            const resData = res.data();
            const readTime = Math.floor((time + resData.readTime) * 10) / 10;
            await db.doc(`readNote/users/${uid}/${isbn}`).update({
                readTime: readTime,
                lastReadDate: new Date().toLocaleString("ja"),
            });
            history.back();
        },

        bookRecord: function (isbn) {
            window.location.href = `https://open-hack-u-2021.web.app/reading_log.html?isbn=${isbn}`;
        },

        bookData: async function () {
            const isbn = location.search.split("=")[1];
            const res = await db.doc(`readNote/users/${uid}/${isbn}`).get();
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
            const res = await db.doc(`readNote/users/${uid}/${isbn}`).get();
            const resData = res.data();
            const updateData = {
                publicReview: vm.public,
                privateReview: vm.private,
            };
            await db.doc(`readNote/users/${uid}/${isbn}`).update(updateData);
            $("#updateAlert").fadeIn("slow", function () {
                $(this).delay(3000).fadeOut("slow");
            });
        },
    },
});