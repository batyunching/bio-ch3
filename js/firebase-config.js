/* =========================================================
   Firebase 設定：和第2章、總入口共用同一個專案（bio-ch2-bingo）
   第3章的即時遊戲資料一律寫在 bingo-ch3/ 底下，不會和第2章的 bingo/ 混在一起。
   學生帳號由總入口（https://batyunching.github.io/bio/）統一管理。
   ========================================================= */
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJqzPBj9Byeda1GOj79sHWXZiDpqQnygs",
  authDomain: "bio-ch2-bingo.firebaseapp.com",
  databaseURL: "https://bio-ch2-bingo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bio-ch2-bingo",
  storageBucket: "bio-ch2-bingo.firebasestorage.app",
  messagingSenderId: "180821849719",
  appId: "1:180821849719:web:3d4cbd0e5aea36aa617872"
};
var FIREBASE_ROOT = "bingo-ch3/";
