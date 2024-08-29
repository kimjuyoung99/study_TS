{
	// 타입 정의
	type Currency = string;
	type ExchangeRates = { [key: string]: number };

	interface APIResponse {
		rates: ExchangeRates;
	}

	// DOM 요소 선택 함수 (타입 가드 사용)
	const getElement = <T extends HTMLElement>(id: string): T => {
		const element = document.getElementById(id);
		if (!element) throw new Error(`Element with id '${id}' not found`);
		return element as T;
	};

	// DOM 요소
	const elements = {
		currencyOne: getElement<HTMLSelectElement>("currency-one"),
		amountOne: getElement<HTMLInputElement>("amount-one"),
		currencyTwo: getElement<HTMLSelectElement>("currency-two"),
		amountTwo: getElement<HTMLInputElement>("amount-two"),
		rate: getElement<HTMLElement>("rate"),
		swap: getElement<HTMLElement>("swap"),
	};

	// API에서 환율 데이터 가져오기
	const getExchangeRates = async (): Promise<ExchangeRates> => {
		const response = await fetch(
			"https://open.exchangerate-api.com/v6/latest"
		);
		const data: APIResponse = await response.json();
		return data.rates;
	};

	// 통화 옵션 목록 생성
	const createCurrencyOptions = (
		rates: ExchangeRates,
		selectElement: HTMLSelectElement,
		defaultCurrency: Currency
	) => {
		Object.keys(rates).forEach((currency) => {
			const rate = rates[currency];
			if (typeof rate === "number") {
				const option = document.createElement("option");
				option.value = currency;
				option.textContent = currency;
				option.setAttribute("data-rate", rate.toString());
				selectElement.appendChild(option);

				if (currency === defaultCurrency) {
					option.selected = true;
				}
			}
		});
	};

	// 선택된 통화의 환율 가져오기
	const getRate = (selectElement: HTMLSelectElement): number => {
		const selectedOption =
			selectElement.options[selectElement.selectedIndex];
		return selectedOption
			? parseFloat(selectedOption.getAttribute("data-rate") || "0")
			: 0;
	};

	// 환율 계산 및 표시
	const calculateExchangeRate = () => {
		const {
			currencyOne,
			currencyTwo,
			amountOne,
			amountTwo,
			rate: rateEl,
		} = elements;
		const rateOne = getRate(currencyOne);
		const rateTwo = getRate(currencyTwo);

		if (rateOne === 0 || rateTwo === 0) {
			console.error("Invalid rate values");
			return;
		}

		const rate = rateTwo / rateOne;
		rateEl.textContent = `1 ${currencyOne.value} = ${rate.toFixed(4)} ${
			currencyTwo.value
		}`;

		const amount = parseFloat(amountOne.value) || 0;
		amountTwo.value = (amount * rate).toFixed(2);
	};

	// 통화 스왑 기능
	const swapCurrencies = () => {
		const { currencyOne, currencyTwo, amountOne, amountTwo } = elements;
		[currencyOne.value, currencyTwo.value] = [
			currencyTwo.value,
			currencyOne.value,
		];
		[amountOne.value, amountTwo.value] = [amountTwo.value, amountOne.value];
		calculateExchangeRate();
	};

	// 초기화 및 이벤트 리스너 설정
	const initializeCurrencyConverter = async () => {
		try {
			const rates = await getExchangeRates();
			const { currencyOne, currencyTwo, amountOne, amountTwo, swap } =
				elements;

			createCurrencyOptions(rates, currencyOne, "USD");
			createCurrencyOptions(rates, currencyTwo, "KRW");
			calculateExchangeRate();

			// 이벤트 리스너 설정
			[currencyOne, amountOne, currencyTwo, amountTwo].forEach((el) =>
				el.addEventListener("input", calculateExchangeRate)
			);
			swap.addEventListener("click", swapCurrencies);
		} catch (error) {
			console.error("Failed to initialize currency converter:", error);
		}
	};

	// 애플리케이션 시작
	initializeCurrencyConverter();
}