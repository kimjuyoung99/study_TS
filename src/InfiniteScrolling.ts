{
	// 타입 정의
	interface Post {
		id: number;
		title: string;
		body: string;
	}

	// DOM 요소 선택 함수
	const selectElement = <T extends HTMLElement>(selector: string): T => {
		const element = document.querySelector<T>(selector);
		if (!element) {
			throw new Error(`Element with selector "${selector}" not found`);
		}
		return element;
	};

	// 로더 생성 및 추가 함수
	const createLoader = (): void => {
		const loader = document.createElement("div");
		loader.classList.add("loader");
		loader.innerHTML = `<span></span><span></span><span></span>`;
		selectElement(".wrap").appendChild(loader);
	};

	// 상태 관리
	const state = {
		limit: 5,
		page: 1,
		isLoading: false,
		currentTerm: "",
		isCheckingScroll: false,
		noMore: false,
	};

	// posts 가져오기 함수
	const getPosts = async (searchTerm: string = ""): Promise<Post[]> => {
		const url = new URL("https://jsonplaceholder.typicode.com/posts");
		url.searchParams.append("_limit", state.limit.toString());
		url.searchParams.append("_page", state.page.toString());
		if (searchTerm) {
			url.searchParams.append("q", searchTerm);
		}

		const res = await fetch(url.toString());
		const data: Post[] = await res.json();

		state.noMore = data.length === 0;
		return data;
	};

	// posts 표시 함수
	const showPosts = async (): Promise<void> => {
		const posts = await getPosts(state.currentTerm);
		const $postsCon = selectElement<HTMLUListElement>("#posts-con");

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
			$postsCon.appendChild(postElm);
		});

		checkScrollable();
	};

	// 새 포스트 로딩 함수
	const loadNewPosts = async (): Promise<void> => {
		if (state.isLoading || state.noMore) return;

		state.isLoading = true;
		selectElement(".loader").classList.add("show");

		try {
			state.page++;
			await showPosts();
		} finally {
			state.isLoading = false;
			selectElement(".loader").classList.remove("show");
		}
	};

	// 스크롤 가능 여부 확인 및 추가 로딩 함수
	const checkScrollable = (): void => {
		if (state.isCheckingScroll) return;
		state.isCheckingScroll = true;

		const checkAndLoad = (): void => {
			if (
				document.documentElement.scrollHeight <= window.innerHeight &&
				!state.noMore
			) {
				loadNewPosts().then(() => setTimeout(checkAndLoad, 1500));
			} else {
				state.isCheckingScroll = false;
			}
		};
		checkAndLoad();
	};

	// 스크롤 이벤트 리스너
	const addScrollListener = (): void => {
		window.addEventListener("scroll", () => {
			const { scrollTop, scrollHeight, clientHeight } =
				document.documentElement;
			if (scrollTop + clientHeight >= scrollHeight - 20) {
				loadNewPosts();
			}
		});
	};

	// 포스트 필터링 함수
	const filterPosts = (): void => {
		const $filter = selectElement<HTMLInputElement>("#filter");
		const searchTerm = $filter.value.trim();
		if (searchTerm !== state.currentTerm) {
			state.currentTerm = searchTerm;
			state.page = 1;
			state.noMore = false;
			selectElement<HTMLUListElement>("#posts-con").innerHTML = "";
			showPosts();
		}
	};

	// 키 이벤트 리스너 추가
	const addKeyListener = (): void => {
		selectElement<HTMLInputElement>("#filter").addEventListener(
			"keyup",
			(e: KeyboardEvent) => {
				if (e.key === "Enter") {
					filterPosts();
				}
			}
		);
	};

	// 초기화 함수
	const initialize = (): void => {
		createLoader();
		addScrollListener();
		addKeyListener();
		showPosts();
	};

	// 애플리케이션 시작
	initialize();
}


// 아래는 클로드 출신 코드~
// interface Post {
//     id: number;
//     title: string;
//     body: string;
// }
// class InfiniteScroll {
//     private postsCon: HTMLElement;
//     private loader: HTMLElement;
//     private filter: HTMLInputElement;
//     private limit: number = 5;
//     private page: number = 1;
//     private isLoading: boolean = false;
//     private currentTerm: string = "";
//     private isCheckingScroll: boolean = false;
//     private noMore: boolean = false;

//     constructor() {
//         this.postsCon = document.getElementById("posts-con") as HTMLElement;
//         this.filter = document.getElementById("filter") as HTMLInputElement;
//         this.loader = document.createElement("div");

//         this.createLoader();
//         this.setupEventListeners();
//         this.showPosts().then(() => {
//             this.checkScrollable();
//         });
//     }

//     private createLoader(): void {
//         this.loader = document.createElement("div");
//         this.loader.classList.add("loader");
//         this.loader.innerHTML = `
//             <span></span>
//             <span></span>
//             <span></span>
//         `;
//         document.querySelector(".wrap")?.appendChild(this.loader);
//     }

//     private setupEventListeners(): void {
//         window.addEventListener("scroll", () => {
//             const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
//             if (scrollTop + clientHeight >= scrollHeight - 20) {
//                 this.newLoading();
//             }
//         });

//         this.filter.addEventListener("keyup", (e: KeyboardEvent) => {
//             if (e.key === "Enter") {
//                 this.filterPosts();
//             }
//         });
//     }

//     private async getPosts(searchTerm: string = ""): Promise<Post[]> {
//         let url = `https://jsonplaceholder.typicode.com/posts?_limit=${this.limit}&_page=${this.page}`;
//         if (searchTerm) {
//             url += `&q=${encodeURIComponent(searchTerm)}`;
//         }
//         const res = await fetch(url);
//         const data: Post[] = await res.json();

//         if (data.length === 0) {
//             this.noMore = true;
//         }
//         return data;
//     }

//     private async showPosts(): Promise<void> {
//         const posts = await this.getPosts(this.currentTerm);
//         console.log(posts);

//         posts.forEach((post) => {
//             const postElm = document.createElement("li");
//             postElm.classList.add("post");
//             postElm.innerHTML = `
//                 <span class="post-number">${post.id}</span>
//                 <div class="post-info">
//                     <h2 class="post-title">${post.title}</h2>
//                     <p class="post-body">${post.body}</p>
//                 </div>
//             `;
//             this.postsCon.appendChild(postElm);
//         });

//         this.checkScrollable();
//     }

//     private newLoading(): void {
//         if (this.isLoading) return;
//         this.isLoading = true;
//         this.loader.classList.add("show");
//         setTimeout(async () => {
//             this.page++;
//             console.log(this.page);
//             await this.showPosts();
//             this.isLoading = false;
//             this.loader.classList.remove("show");
//         }, 1000);
//     }

//     private checkScrollable(): void {
//         if (this.isCheckingScroll) return;
//         this.isCheckingScroll = true;

//         const checkAndLoad = () => {
//             if (
//                 document.documentElement.scrollHeight <= window.innerHeight &&
//                 !this.noMore
//             ) {
//                 this.newLoading();
//                 setTimeout(checkAndLoad, 1500);
//             } else {
//                 this.isCheckingScroll = false;
//             }
//         };
//         checkAndLoad();
//     }

//     private filterPosts(): void {
//         const searchTerm = this.filter.value.trim();
//         if (searchTerm !== this.currentTerm) {
//             this.currentTerm = searchTerm;
//             this.page = 1;
//             this.postsCon.innerHTML = "";
//             this.showPosts();
//             this.noMore = false;
//         }
//     }
// }

// new InfiniteScroll();