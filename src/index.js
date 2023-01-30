// ! name.common замінити на name.official
// ! Зробити клас і екземпляр класу
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

// Робота з lodash.debounce
const debounce = require('lodash.debounce');
const DEBOUNCE_DELAY = 300;

const searchBox = document.getElementById('search-box');
searchBox.addEventListener('input', debounce(checkCountries, DEBOUNCE_DELAY)); //робимо затримку у 300мс
searchBox.placeholder = 'Start type here country name';
searchBox.style.width = '230px';

// Фукнкція перевірки назви країни
function checkCountries(e) {
  const inputData = e.target.value.trim(); //дивимось у input, прибираємо пробіли на початку і в кінці

  if (!inputData) {
    //якщо нічого немає, то чистимо розмітку і виходимо
    clearHTML();
    return;
  }

  countries
    .fetchCountries(inputData) // викликаємо функцію запиту публічного API і передаємо їй введену у input назву країни
    .then(array => {
      // ^Результат позитивного виконання промісу є масив об'єктів:
      if (!array.length) {
        //якщо довжина масиву нульова
        throw new Error('Oops, there is no country with that name');
      } else if (array.length >= 10) {
        //якщо довжина масиву >10
        throw new Error('Too many matches found. Please enter a more specific name.');
      } else if (array.length > 1 && array.length < 10) {
        // * якщо довжина масиву від 2 до 10, то роблю список країн:
        return array.reduce((previousValue, currentValue) => {
          return renderMarkupCountriesList(currentValue) + previousValue; // & повертає розмітку для кожного елементу масиву (об'єкт) і зшиває її
        }, '');
      }

      // * Якщо довжина масиву === 1, то вивожу дані по одній країні
      return renderMarkupCountryInfo(array); // & повертає розмітку для однієї країни
    })
    .then(markup => {
      //перевіряю яка саме розмітка приходить - список чи одна країна:
      if (markup.includes('</li>')) {
        // * Якщо так, то це перелік країн, значить роблю розмітку для переліку країн:
        clearHTML();
        document.querySelector('.country-list').innerHTML = markup;

        // додаю стилі для кожної <li>:
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

      // * Інакше роблю розмітку для однієї країни:
      else {
        clearHTML();
        document.querySelector('.country-info').innerHTML = markup;

        // додаю стилі:
        const country = document.querySelector('.country');
        country.style.display = 'flex';

        const countryName = document.querySelector('.country-name');
        countryName.style.fontSize = '36px';

        const img = document.querySelector('.country-flag-svg');
        img.style.marginRight = '20px';
        img.style.width = '50px';

        // спамів з однаковим класом є декілька, тому перебираю їх циклом:
        const simpleText = document.querySelectorAll('.simpleText');
        for (const span of simpleText) {
          span.style.font = 'caption';
        }
      }
    })
    .catch(onError);
}

// Функція малювання розмітки переліку країн
function renderMarkupCountriesList({ name, flags: { svg: flag } }) {
  return `
    <li class = "country-item">
      <img src="${flag}" alt="flag.svg" class="country-flag-svg" />
      <h2 class="country-name">${name}</h2>
    </li>
  `;
}

// Функція малювання розмітки однієї країни
function renderMarkupCountryInfo(array) {
  // ^ Нижче перезаписую ці змінні у випадку їх відсутності у базі, тому let, а не const
  // Десктруктурізація масиву:
  let [
    {
      name,
      capital,
      population,
      flags: { svg: flag },
      languages, // це масив об'єктів
    },
  ] = array;

  // роблю з масиву мов рядок з комами
  const countryLanguagesArr = [];
  for (const lang of languages) {
    countryLanguagesArr.push(lang.name);
  }
  const countryLanguages = countryLanguagesArr.join(', '); // кома після останнього значення не додається

  // ^ В базі відсутні деякі дані (undefined), тому перевіряю на наявність, щоби виводити зрозуміле повідомлення замість "undefined":
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

// Функція обробки помилок
function onError(error) {
  clearHTML();

  // не придумав як інакше можна за типом помилки підставляти "info" чи "failure" у Nofify
  if (error.message.includes('Too')) {
    Notiflix.Notify.info(error.message);
  } else {
    Notiflix.Notify.failure(error.message);
  }
}

// Функція очищення розмітки
function clearHTML() {
  document.querySelector('.country-list').innerHTML = '';
  document.querySelector('.country-info').innerHTML = '';
}
