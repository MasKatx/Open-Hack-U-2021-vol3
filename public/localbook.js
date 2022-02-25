// 石田君からいただいたソース(ホーム画面)

let db = {};
document.addEventListener("DOMContentLoaded", async function () {
  // db = await firebase.firestore();
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
    myBook: [{
      title: "七つの会議",
      author: "池井戸潤",
      img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/4123/9784087454123.jpg?_ex=120x120",
      url: "https://books.rakuten.co.jp/rb/13614117/?scid=af_pc_etc&sc2id=af_101_0_0",
      isbn: "9784087454123"
    }, {
      title: "新・明解Java入門 第2版",
      author: "柴田望洋",
      img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/6015/9784815606015.jpg?_ex=120x120",
      url: "https://books.rakuten.co.jp/rb/16376516/?scid=af_pc_etc&sc2id=af_101_0_0",
      isbn: "9784815606015"
    }],
    startTime: 0,
    endTime: 0,
    elapsedTime: 0,
    passSecond: 0,
    countUp: null,
    pause: "一時停止",
  },
  methods: {
    bookSearch: async function () {
      this.bookSearchResult = [];
      const sort = $("option:selected").val();
      let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&sort=${sort}&applicationId=1088025467655525347&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
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
          }
        );
      }
    },
    myBooksGet: async function () {
      return;
      // this.myBook = [];
      // const userName = "ishida";
      // // users(c) -> user(d) -> ishida(c) -> book(d)
      // // await db.doc(`users/user/${userName}/${bookIsbn}`).set({
      // //     title: "this is title",
      // //     author: "mr.k",
      // //     img: "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0542/9784088920542_1_4.jpg?_ex=120x120",
      // //     url: "https://books.rakuten.co.jp/rb/16795162/?scid=af_pc_etc&sc2id=af_101_0_0",
      // // });
      // const testLog = await db.collection(`users/user/${userName}`).get();
      // // console.log(testLog.docs.map(postDoc => postDoc.id))
      // testLog.forEach((postDoc) => {
      //     const dic = postDoc.data();
      //     this.myBook.push({ title: dic.title, author: dic.author, img: dic.img, url: dic.url, isbn: dic.isbn });
      //     console.log(postDoc.id, ' => ', dic);
      // });
    },
    myBookAdd: async function () {
      return;
      // if (this.isbn.length != 13) {
      //     alert("13桁のISBN(バーコードの番号)を入力してください");
      //     return;
      // }
      // let url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&isbn=${this.isbn}&applicationId=${fffun()}&affiliateId=245eb4c3.2431bbf0.245eb4c4.d8af5e40`;
      // const res = await fetch(url);
      // const resJson = await res.json();
      // this.flg = resJson.Items.length > 0;
      // if (resJson.Items.length == 0) {
      //     this.bookSearchResult.push({ title: "見つかりませんでした" });
      //     return;
      // }
      // const item = resJson.Items[0].Item;
      // console.log(item.isbn);
      // const addData = {
      //     title: item.title.replace("　", " "),
      //     author: item.author,
      //     img: item.mediumImageUrl,
      //     url: item.affiliateUrl,
      //     isbn: item.isbn,
      // };
      // const bookIsbn = item.isbn;
      // const userName = "ishida";
      // await db.doc(`users/user/${userName}/${bookIsbn}`).set(addData);
      // const testLog = await db.collection(`users/user/${userName}`).get();
      // testLog.forEach((postDoc) => {
      //     const dic = postDoc.data();
      //     this.myBook.push({
      //         title: dic.title,
      //         author: dic.author,
      //         img: dic.img,
      //         url: dic.url,
      //         isbn: dic.isbn,
      //     });
      //     console.log(postDoc.id, ' => ', dic);
      // })
      // this.myBooksGet();
    },
    read: function (isbn) {
      window.location.href = `https://open-hack-u-2021.web.app/timer.html?isbn=${isbn}`;
    },
    timerLoad: function () {
      this.timerStart();
      this.passSecond = this.passSecond > 0 ? this.passSecond : Math.floor((Date.now() - this.startTime) / 1000);
      this.countUp = setInterval(() => this.passSecond++, 1000);
    },
    // timerUp: function () {
    //     this.passSecond++;
    // },
    timerStart: function () {
      console.log("start");
      this.startTime = Date.now();
    },
    timerPause: function () {
      if (this.pause === "一時停止") {
        this.pause = "再開";
        clearInterval(this.countUp);
      } else {
        this.pause = "一時停止";
        this.countUp = setInterval(() => this.passSecond++, 1000);
      }
    },
    timerEnd: function () {
      this.endTime = Date.now();
      this.elapsedTime = this.endTime - this.startTime;
      const second = this.elapsedTime / 1000;
      clearInterval(this.countUp);
      console.log(second);
      console.log(this.passSecond);
    },
    bookRecord: function (isbn) {
      window.location.href = `https://open-hack-u-2021.web.app/reading_log.html?isbn=${isbn}`;
    }
  }
})