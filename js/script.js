let currencyRepository = (function() {

    let currencyList = [];
    let comparisonArray = [
        {name: 'USA', rate: 1, title: 'United States', symbol: '$' }
    ];

    let apiUrl1 = 'https://api.vatcomply.com/rates';
    let apiUrl2 = "https://restcountries.com/v3.1/currency/"

    // retrieves name abbreviation and exchange rate from Vat API 
    function createCurrencyObjs() {
        // uiFunctions.showLoadingMessage();
        return fetch(apiUrl1).then(function (response) {
          return response.json(); // gets promise
        }).then(function (json) {
        //   uiFunctions.hideLoadingMessage();
        let obj = json.rates; // gets data
        /* loops through object for each currency, creates a new object with key value pairs 
        and passes the object to a function to add more details and add object to an array */
        for (const property in obj) {
            let currency = {
                name: property,
                rate: obj[property]
            };
            addCurrencyDetails(currency);
        } 
        }).catch(function (e) {
          console.error(e);
        });

    }

    /* retrieves full name and symbol per currency from rest API and adds items   
    to the currency's object, then adds the completed object to the array */
    function addCurrencyDetails(currency) {
        let url = apiUrl2 + currency.name;
        return fetch(url).then(function (response) {
            return response.json();
        }).then(function (details) {
            currency.title = details[0].currencies[currency.name].name;
            currency.symbol = details[0].currencies[currency.name].symbol;
            add(currency);
        }).catch(function (e) {
            console.error(e);
        });
    }

    // adds a currency object to the array
    function add(currency) {
        // checks that new entry is an object and tests if the keys match with the existing object
        if (typeof currency === "object" && checkCurrencyKeys(currency, comparisonArray[0])) {
            // adds new object to currencyList array
            currencyList.push(currency);
        }
    }

    // checks if new currency object's keys match currencyList
    function checkCurrencyKeys(currency, comparisonArray) {
        //gets existing and new object array entries
        let newObjKeys = Object.keys(currency);
        let currObjKeys = Object.keys(comparisonArray);

        // checks that the number of keys match the existing object
        if (newObjKeys.length === currObjKeys.length) {
            /* loops through each key of an existing object and checks that 
            the new object has the key -- will return false at the first 
            instance of a mismatch */
            return currObjKeys.every((key) => {
                return newObjKeys.includes(key);
            });
        }
    }

    // adds new currency name to unordered list and makes it a button to show details
    function addSelectItem(currency, currencies) {
        let selectItem = document.createElement('option');
        selectItem.innerText = currency.title;
        currencies.appendChild(selectItem);
    }

    // creates function to return all objects in array
    function getAll() {
        return currencyList;
    }

    // creates keys that allow the functions to be accessible outside of the scope of this function's state
    return {
        createCurrencyObjs: createCurrencyObjs,
        add: add,
        addSelectItem: addSelectItem,
        getAll: getAll
    };

})();

// assigns array of currency objects to allCurrencies variable
let allCurrencies = currencyRepository.getAll();

// sets up HTML elements to display the currency list within
let baseCurrency = document.querySelector("#baseCurrency");
let convertCurrency = document.querySelector("#convertCurrency");

// loops through all available currencies and adds them to an unordered list
currencyRepository.createCurrencyObjs().then(function() {
    // Now the data is loaded! 
    console.log(allCurrencies);
    console.log(allCurrencies[0]);
    console.log(allCurrencies.length);
    allCurrencies.forEach(function(currency){
        currencyRepository.addSelectItem(currency, baseCurrency);
    });
});