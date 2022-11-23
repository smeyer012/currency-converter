let currencyRepository = (function() {

    let currencyList = [];
    let currencyRates = [];
    let comparisonArray1 = [
        {name: 'USA', rate: 1, title: 'United States', symbol: '$' }
    ];
    let comparisonArray2 = [
        {name: 'USA', rate: 1}
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
        const tempArray = [];
        for (const property in obj) {
            let currency = {
                name: property,
                rate: obj[property]
            };
            tempArray.push(currency);
        }
        return Promise.all(tempArray.map(addCurrencyDetails));

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
            add(currency, currencyList);
        }).catch(function (e) {
            console.error(e);
        });
    }

    // adds a currency object to the array
    function add(currency, theArray) {
        // checks that new entry is an object and tests if the keys match with the existing object
        if (typeof currency === "object" && (checkCurrencyKeys(currency, comparisonArray1[0]) || currency, comparisonArray2[0]) ) {
            // adds new object to currencyList array
            theArray.push(currency);
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
        selectItem.setAttribute("value", currency.name);
        // selectItem.setAttribute("data-rate", "");
        currencies.appendChild(selectItem);
    }

    // creates function to return all objects in array
    function getAll() {
        return currencyList;
    }

    function getTheRates(baseCurrencyName) {

        baseCurrencyURL = apiUrl1 + '?base=' + baseCurrencyName;   

        return fetch(baseCurrencyURL).then(function (response) {
            return response.json(); // gets promise
        }).then(function (json) {
            //uiFunctions.hideLoadingMessage();
            let obj = json.rates; // gets data
            /* loops through object with all currencies and assigns the 
            key/value pairs to individual objects to be added to an array */
            for (const property in obj) {
                let currency = {
                name: property,
                rate: obj[property]
                };
                add(currency, currencyRates);
            }
        }).catch(function (e) {
            console.error(e);
        });

    }

    function getAllCurrencyRates() {
        return currencyRates;
    }

    function getSymbol(currencyName, symBox) {
        // adds chosen currency symbol to field
        let currencyObj = allCurrencies.find(obj => {
            return obj.name === currencyName;
        });
        if (symBox === 'base') {
            let symbol1box = document.getElementById('baseCurrencySymbol');
            symbol1box.innerText = currencyObj.symbol;
        }
        else {
            let symbol2box = document.getElementById('convertCurrencySymbol');
            symbol2box.innerText = currencyObj.symbol;
        }
        
    }

    // creates keys that allow the functions to be accessible outside of the scope of this function's state
    return {
        createCurrencyObjs: createCurrencyObjs,
        add: add,
        addSelectItem: addSelectItem,
        getAll: getAll,
        getTheRates: getTheRates,
        getAllCurrencyRates: getAllCurrencyRates,
        getSymbol: getSymbol,
    };

})();

// assigns array of currency objects to allCurrencies variable
let allCurrencies = currencyRepository.getAll('currencyList');

// sets up HTML elements to display the currency list within
let baseCurrency = document.querySelector("#baseCurrency");
let convertCurrency = document.querySelector("#convertCurrency");
let input1 = document.getElementById('currencyInput1');
let input2 = document.getElementById('currencyInput2');

// loops through all available currencies and adds them to an unordered list
currencyRepository.createCurrencyObjs().then(function() {
    // Now the data is loaded! 
    allCurrencies.forEach(function(currency){
        currencyRepository.addSelectItem(currency, baseCurrency);
        currencyRepository.addSelectItem(currency, convertCurrency);
    });
});

baseCurrency.addEventListener("change", function(e) {
    let baseCurrencyName = e.target.value;
    
    currencyRepository.getSymbol(baseCurrencyName, 'base');

    currencyRepository.getTheRates(baseCurrencyName).then(function() {    
        let allRates = currencyRepository.getAllCurrencyRates();
        allRates.forEach(function(currency) {
            let selectCurrency = convertCurrency.querySelector('option[value=' + currency.name + ']');
            selectCurrency.dataset.rate = currency.rate;
        });
        if (convertCurrency.value != "" && input2.value == "") {
            let convertRate = convertCurrency.options[convertCurrency.selectedIndex].dataset.rate;
            input2.value = input1.value*convertRate;
        }
    });

});

convertCurrency.addEventListener("change", function(e) {
    let convertCurrencyName = e.target.value;
    let convertRate = e.target.options[e.target.selectedIndex].dataset.rate;

    currencyRepository.getSymbol(convertCurrencyName, 'convert');

    if (baseCurrency.value != "") {
        input2.value = input1.value*convertRate;
    }

});

input1.addEventListener("change", function(e) {
    let convertRate = convertCurrency.options[convertCurrency.selectedIndex].dataset.rate;
    input2.value = input1.value*convertRate;
});

input2.addEventListener("change", function(e) {
    let convertRate = convertCurrency.options[convertCurrency.selectedIndex].dataset.rate;
    input1.value = input2.value/convertRate;
});
