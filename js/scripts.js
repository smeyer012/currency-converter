///////  UX/UI Utilities   ///////

let uiFunctions = (function() {


  //// Loading Message //// 

  let main = document.querySelector('main');
  let loadingContainer = document.createElement('div');
  let loadingTitle = document.createElement('h3');
  let imgContainer = document.createElement('div');

  loadingContainer.classList.add('loading');
  imgContainer.classList.add('spinner');

  function showLoadingMessage() {
    loadingTitle.innerText = 'Loading';
    imgContainer.style.backgroundImage = "url('img/loading.gif')";
    loadingContainer.appendChild(loadingTitle);
    loadingContainer.appendChild(imgContainer);
    main.appendChild(loadingContainer);

    loadingContainer.classList.add('visible');
  }

  function hideLoadingMessage() {
    loadingContainer.classList.remove('visible'); 
    setTimeout(function() {
      main.removeChild(loadingContainer);
    }, 2000);
  }

  return {
    showLoadingMessage: showLoadingMessage,
    hideLoadingMessage: hideLoadingMessage
  };

})();

let currencyRepository = (function() {

  // sets up array of currency objects
  // let currencyList = [
  //   {name: 'United States Dollar', code: 'USD', symbol: '\u0024', rate: 0.9673 },
  //   {name: 'Euro', code: 'EUR', symbol: '\u20AC', rate: 1 },
  //   {name: 'British Pound Sterling', code: 'GPB', symbol: '\u00A3', rate: 0.6088 }
  // ];

  let currencyList = [];
  let comparisonArray = [
    {name: 'USA', rate: 0.1}
  ];
  let apiUrl = 'https://api.vatcomply.com/rates';

  // gets currency name and exchange rate from Vat API
  function loadList() {
    uiFunctions.showLoadingMessage();
    return fetch(apiUrl).then(function (response) {
      return response.json(); // gets promise
    }).then(function (json) {
      uiFunctions.hideLoadingMessage();
      let obj = json.rates; // gets data
      /* loops through object with all currencies and assigns the 
      key/value pairs to individual objects to be added to an array */
      for (const property in obj) {
        let currency = {
          name: property,
          rate: obj[property]
        };
        add(currency);
      }
    }).catch(function (e) {
      console.error(e);
    })
  }

  // creates function to add a currency object to the array
  function add(currency) {
    // checks that new entry is an object and tests if the keys match with the existing object
    if (typeof currency === "object" && checkCurrencyKeys(currency, comparisonArray[0])) {
      // adds new object to currencyList array
      currencyList.push(currency);
    }
  }

  // sets up HTML element to display the currency list within
  let currencies = document.querySelector("#currencies");

  // adds new currency name to unordered list and makes it a button to show details
  function addListItem(currency) {
    let listItem = document.createElement('li');
    let button = document.createElement('button');
    button.innerText = currency.name;
    button.classList.add('currency_button');
    addEvL(button, 'click', showDetails, currency.name)
    // button.addEventListener("click", function() {
    //   showDetails(currency);
    // });
    listItem.appendChild(button);
    currencies.appendChild(listItem);
  }

  // function to add addEventListener
  function addEvL(element, event='click', function_name, parameter) {
    element.addEventListener(event, function() {
      function_name(parameter);
    });
  }

  // checks if new currency object's keys match currencyList
  function checkCurrencyKeys(currency, comparisonArray) {
    //gets existing and new object array entries
    let newObjKeys = Object.keys(currency);
    let currObjKeys = Object.keys(comparisonArray);

    /* loops through each key of an existing object and checks that 
    the new object has the key -- will return false at the first 
    instance of a mismatch */
    return currObjKeys.every((key) => {
      return newObjKeys.includes(key);
    });

  }

  // creates function to return all objects in array
  function getAll() {
    return currencyList;
  }

  /* gets currency data from the REST Countries API and creates an array of 
  countries that utilize the particular currency */
  function loadDetails(currencyName) {
    uiFunctions.showLoadingMessage();
    let url = "https://restcountries.com/v3.1/currency/" + currencyName;
    return fetch(url).then(function (response) {
      return response.json();
    }).then(function (details) {
      uiFunctions.hideLoadingMessage();
      let countryList = [];
      for (i = 0; i<details.length; i++) {
        countryList.push(details[i].name.common);
      }
      let currencyData = {
        currencyCountries: countryList,
        currencyTitle: details[0].currencies[currencyName].name,
        currencySymbol: details[0].currencies[currencyName].symbol
      }
      return currencyData;

    }).catch(function (e) {
      console.error(e);
    });
  }

  // accesses currency data and calls modal function with dynamic content
  function showDetails(currencyName) {
    loadDetails(currencyName).then(function (currencyData) {
      modalFunctions.showModal('These are the countries that use the ' + currencyData.currencyTitle + ' (notation: ' + currencyData.currencySymbol + ') as their currency:', currencyData.currencyCountries);
    });
  }

  // creates search function that filters the currency array objects by exchange rate
  function searchList(button) {

    // sets up HTML element to display the results within
    let searchlist = document.getElementById("searchResultList");

    // filter function
    let searchResults = currencyList.filter(function (currency) {
      if (currency.rate < 1) {
        return true;
      }
      return false;
    });

    // adds results of filter to an unordered list
    let currencyListInner = '';
    searchResults.forEach(function (searchArrayItem) {
      currencyListInner = currencyListInner + '<li>' + searchArrayItem.name + ' - rate: ' + searchArrayItem.rate + '</li>';
    });
    searchlist.innerHTML = currencyListInner;

    // hides search button once clicked
    button.style.display = 'none';

  }

  // creates keys that allow the functions to be accessible outside of the scope of this function's state
  return {
    add: add,
    addListItem: addListItem,
    getAll: getAll,
    loadList: loadList,
    searchList: searchList
  };

})();

// assigns array of currency objects to allCurrencies variable
let allCurrencies = currencyRepository.getAll();

// loops through all available currencies and adds them to an unordered list
currencyRepository.loadList().then(function() {
  // Now the data is loaded! 
  allCurrencies.forEach(function(currency){
    currencyRepository.addListItem(currency);
  });
});

// executes search function on click of searchbutton
let searchbutton = document.getElementById("searchbutton");
searchbutton.addEventListener("click", function() {
  currencyRepository.searchList(searchbutton);
});


///////  MODAL   ///////

let modalFunctions = (function() {
  
  let modalContainer = document.querySelector('#modal-container');
  
  // builds content dynamically for modal
  function showModal(title, text) {
    modalContainer.innerHTML = '';
    let modal = document.createElement('div');
    modal.classList.add('modal');

    let closeButtonElement = document.createElement('button');
    closeButtonElement.classList.add('modal-close');
    closeButtonElement.innerText = 'Close';
    //hides modal if 'Close' link is clicked
    closeButtonElement.addEventListener('click', hideModal);

    let titleElement = document.createElement('h1');
    titleElement.innerText = title;

    let contentElement = document.createElement('ul');
    for (i=0; i<text.length; i++) {
      let listItem = document.createElement('li');
      listItem.innerText = text[i];
      contentElement.appendChild(listItem);
    }

    modal.appendChild(closeButtonElement);
    modal.appendChild(titleElement);
    modal.appendChild(contentElement);
    modalContainer.appendChild(modal);
    
    modalContainer.classList.add('is-visible');
  }

  // function to hide modal
  function hideModal() {
    modalContainer.classList.remove('is-visible');
  }

  // hides modal if esc is pressed
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
      hideModal();  
    }
  });
  
  // hides modal if user clicks outside of the modal window
  modalContainer.addEventListener('click', (e) => {
    // Since this is also triggered when clicking INSIDE the modal
    // We only want to close if the user clicks directly on the overlay
    let target = e.target;
    if (target === modalContainer) {
      hideModal();
    }
  });

  return {
    showModal: showModal
  };

  // THE RETURN STATEMENT HERE
})();
