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
{
    const getElement = (id) => {
        const element = document.getElementById(id);
        if (!element)
            throw new Error(`Element with id '${id}' not found`);
        return element;
    };
    const elements = {
        currencyOne: getElement("currency-one"),
        amountOne: getElement("amount-one"),
        currencyTwo: getElement("currency-two"),
        amountTwo: getElement("amount-two"),
        rate: getElement("rate"),
        swap: getElement("swap"),
    };
    const getExchangeRates = () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield fetch("https://open.exchangerate-api.com/v6/latest");
        const data = yield response.json();
        return data.rates;
    });
    const createCurrencyOptions = (rates, selectElement, defaultCurrency) => {
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
    const getRate = (selectElement) => {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        return selectedOption
            ? parseFloat(selectedOption.getAttribute("data-rate") || "0")
            : 0;
    };
    const calculateExchangeRate = () => {
        const { currencyOne, currencyTwo, amountOne, amountTwo, rate: rateEl, } = elements;
        const rateOne = getRate(currencyOne);
        const rateTwo = getRate(currencyTwo);
        if (rateOne === 0 || rateTwo === 0) {
            console.error("Invalid rate values");
            return;
        }
        const rate = rateTwo / rateOne;
        rateEl.textContent = `1 ${currencyOne.value} = ${rate.toFixed(4)} ${currencyTwo.value}`;
        const amount = parseFloat(amountOne.value) || 0;
        amountTwo.value = (amount * rate).toFixed(2);
    };
    const swapCurrencies = () => {
        const { currencyOne, currencyTwo, amountOne, amountTwo } = elements;
        [currencyOne.value, currencyTwo.value] = [
            currencyTwo.value,
            currencyOne.value,
        ];
        [amountOne.value, amountTwo.value] = [amountTwo.value, amountOne.value];
        calculateExchangeRate();
    };
    const initializeCurrencyConverter = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rates = yield getExchangeRates();
            const { currencyOne, currencyTwo, amountOne, amountTwo, swap } = elements;
            createCurrencyOptions(rates, currencyOne, "USD");
            createCurrencyOptions(rates, currencyTwo, "KRW");
            calculateExchangeRate();
            [currencyOne, amountOne, currencyTwo, amountTwo].forEach((el) => el.addEventListener("input", calculateExchangeRate));
            swap.addEventListener("click", swapCurrencies);
        }
        catch (error) {
            console.error("Failed to initialize currency converter:", error);
        }
    });
    initializeCurrencyConverter();
}
