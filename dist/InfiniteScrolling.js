"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class InfiniteScroll {
    constructor() {
        this.limit = 5;
        this.page = 1;
        this.isLoading = false;
        this.currentTerm = "";
        this.isCheckingScroll = false;
        this.noMore = false;
        this.postsCon = document.getElementById("posts-con");
        this.filter = document.getElementById("filter");
        this.loader = document.createElement("div");
        this.createLoader();
        this.setupEventListeners();
        this.showPosts().then(() => {
            this.checkScrollable();
        });
    }
    createLoader() {
        var _a;
        this.loader = document.createElement("div");
        this.loader.classList.add("loader");
        this.loader.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        (_a = document.querySelector(".wrap")) === null || _a === void 0 ? void 0 : _a.appendChild(this.loader);
    }
    setupEventListeners() {
        window.addEventListener("scroll", () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                this.newLoading();
            }
        });
        this.filter.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                this.filterPosts();
            }
        });
    }
    getPosts() {
        return __awaiter(this, arguments, void 0, function* (searchTerm = "") {
            let url = `https://jsonplaceholder.typicode.com/posts?_limit=${this.limit}&_page=${this.page}`;
            if (searchTerm) {
                url += `&q=${encodeURIComponent(searchTerm)}`;
            }
            const res = yield fetch(url);
            const data = yield res.json();
            if (data.length === 0) {
                this.noMore = true;
            }
            return data;
        });
    }
    showPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const posts = yield this.getPosts(this.currentTerm);
            console.log(posts);
            posts.forEach((post) => {
                const postElm = document.createElement("li");
                postElm.classList.add("post");
                postElm.innerHTML = `
                <span class="post-number">${post.id}</span>
                <div class="post-info">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-body">${post.body}</p>
                </div>
            `;
                this.postsCon.appendChild(postElm);
            });
            this.checkScrollable();
        });
    }
    newLoading() {
        if (this.isLoading)
            return;
        this.isLoading = true;
        this.loader.classList.add("show");
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this.page++;
            console.log(this.page);
            yield this.showPosts();
            this.isLoading = false;
            this.loader.classList.remove("show");
        }), 1000);
    }
    checkScrollable() {
        if (this.isCheckingScroll)
            return;
        this.isCheckingScroll = true;
        const checkAndLoad = () => {
            if (document.documentElement.scrollHeight <= window.innerHeight &&
                !this.noMore) {
                this.newLoading();
                setTimeout(checkAndLoad, 1500);
            }
            else {
                this.isCheckingScroll = false;
            }
        };
        checkAndLoad();
    }
    filterPosts() {
        const searchTerm = this.filter.value.trim();
        if (searchTerm !== this.currentTerm) {
            this.currentTerm = searchTerm;
            this.page = 1;
            this.postsCon.innerHTML = "";
            this.showPosts();
            this.noMore = false;
        }
    }
}
new InfiniteScroll();
