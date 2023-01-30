import countries from './fetchCountries';
import './css/styles.css';

import Notiflix from 'notiflix';
Notiflix.Notify.init({
  position: 'center-top',
  opacity: 0.8,
  timeout: 2500,
  clickToClose: true,
  fontSize: '16px',
});

const debounce = require('lodash.debounce');

const DEBOUNCE_DELAY = 300;

const searchBox = document.getElementById('search-box');
searchBox.addEventListener('input', debounce(checkCountries, DEBOUNCE_DELAY));
searchBox.placeholder = 'Start type here country name';
searchBox.style.width = '230px';

function checkCountries(e) {
  const inputData = e.target.value.trim();

  if (!inputData) {
    clearHTML();
    return;
  }

  countries
    .fetchCountries(inputData)
    .then(array => {
      if (!array.length) {
        throw new Error('Oops, there is no country with that name');
      } else if (array.length >= 10) {
        throw new Error('Too many matches found. Please enter a more specific name.');
      } else if (array.length > 1 && array.length < 10) {
        // Роблю список країн
        return array.reduce((previousValue, currentValue) => {
          return renderMarkupCountriesList(currentValue) + previousValue;
        }, '');
      }

      // Вивожу дані по одній країні
      return renderMarkupCountryInfo(array);
    })
    .then(markup => {
      if (markup.includes('</li>')) {
        // Розмітка переліку країн:

        clearHTML();

        document.querySelector('.country-list').innerHTML = markup;

        const countryItems = document.querySelectorAll('.country-item');

        for (const countryItem of countryItems) {
          countryItem.style.display = 'flex';
          countryItem.style.alignItems = 'center';
          countryItem.style.marginBottom = '10px';
          const img = countryItem.querySelector('.country-flag-svg');
          img.style.marginRight = '20px';
          img.style.width = '50px';

          const h2 = countryItem.querySelector('.country-name');
          h2.style.margin = 0;
        }
      }

      // Розмітка однієї країни:
      else {
        clearHTML();

        document.querySelector('.country-info').innerHTML = markup;
        const country = document.querySelector('.country');
        const countryName = document.querySelector('.country-name');
        const img = document.querySelector('.country-flag-svg');
        const simpleText = document.querySelectorAll('.simpleText');

        country.style.display = 'flex';
        countryName.style.fontSize = '36px';
        img.style.marginRight = '20px';
        img.style.width = '50px';

        for (const span of simpleText) {
          span.style.font = 'caption';
        }
      }
    })
    .catch(onError);
}

// Функція малювання розмітки переліку країн
function renderMarkupCountriesList({ name, flags: { svg } }) {
  return `
    <li class = "country-item">
      <img src="${svg}" alt="flag.svg" class="country-flag-svg" />
      <h2 class="country-name">${name}</h2>
    </li>
  `;
}

// Функція малювання розмітки однієї країни
function renderMarkupCountryInfo(array) {
  let [
    // Нижче перезаписую ці дані у випадку їх відсутності у базі, тому let, а не const
    {
      name,
      capital,
      population,
      flags: { svg: flag },
      languages,
    },
  ] = array;

  const countryLanguagesArr = [];
  for (const lang of languages) {
    countryLanguagesArr.push(lang.name);
  }
  const countryLanguages = countryLanguagesArr.join(', ');
  // В базі відсутні деякі дані (undefined), тому перевіряю на наявність
  if (!name) {
    name = 'Назва країни невідома';
  }

  if (!capital) {
    capital = 'Столиця не відома';
  }
  if (!flag) {
    flag = 'Прапор невідомий';
  }
  if (!population) {
    population = 'Дані про населення відсутні';
  }
  if (!countryLanguages) {
    countryLanguages = 'Дані про мови відсутні';
  }

  return `
  <div class="country">
  <img src="${flag}" alt="flag.svg" class="country-flag-svg" width = "200px" />
  <h2 class="country-name">${name}</h2>
  </div>
  <h3 class="country-capital">Capital: <span class="simpleText">${capital}</span></h3>
  <h3 class="country-population">Population: <span class="simpleText">${population}</span></h3>
  <h3 class="country-language">Languages: <span class="simpleText">${countryLanguages}</span></h3>
  `;
}

function onError(error) {
  clearHTML();
  if (error.message.includes('Too')) {
    // не придумав як ще за помилкою відрізнити "info" і "failure" у Nofify
    Notiflix.Notify.info(error.message);
  } else {
    Notiflix.Notify.failure(error.message);
  }
}

// Очищую
function clearHTML() {
  document.querySelector('.country-list').innerHTML = '';
  document.querySelector('.country-info').innerHTML = '';
}
