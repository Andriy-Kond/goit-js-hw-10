// ! name.common замінити на name.official
// ! Зробити пагінацію (клас і екземпляр класу)
import './css/styles.css';
import countries from './fetchCountries';
import Notiflix from 'notiflix';

Notiflix.Notify.init({
  position: 'center-top',
  opacity: 0.8,
  timeout: 2500,
  clickToClose: true,
  fontSize: '16px',
});

// Підключаю lodash.debounce
const debounce = require('lodash.debounce');
const DEBOUNCE_DELAY = 300;

window.onload = () => document.querySelector('#search-box').focus();
const searchBox = document.getElementById('search-box');
searchBox.placeholder = 'Start type here country name';
searchBox.style.width = '230px';
searchBox.addEventListener('input', debounce(checkCountries, DEBOUNCE_DELAY)); // Робимо затримку у 300мс

// Фукнкція перевірки назви країни
function checkCountries(e) {
  const inputData = e.target.value.trim(); // Дивимось у input, прибираємо пробіли на початку і в кінці

  if (!inputData) {
    // Якщо нічого немає, то чистимо розмітку і виходимо
    clearHTML();
    return;
  }

  countries
    .fetchCountries(inputData) // викликаємо функцію запиту публічного API і передаємо їй введену у input назву країни

    // ^ Результат позитивного виконання промісу є масив об'єктів:
    .then(array => {
      // Якщо довжина масиву нульова:
      if (!array.length) {
        throw new Error('Oops, there is no country with that name');
      }
      // Якщо довжина масиву > 10:
      else if (array.length > 10) {
        throw new Error('Too many matches found. Please enter a more specific name.');
      }
      // Якщо довжина менше 10, то викликаємо функцію малювання розмітки:
      else {
        return renderMarkupCountry(array); // передаємо отриманий з промісу масив.
      }
    })
    .then(markup => {
      console.log('checkCountries >> markup:::', markup);
      // Перевіряю яка саме розмітка прийшла - для списку чи однієї країни:
      // ??? Не знаю як інакше їх розрізнити
      // * Якщо розмітка містить закриваючий тег </li>, то це перелік країн, значить додаю цю розмітку у ul.country-list:
      clearHTML();

      if (markup.includes('</li>')) {
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

      // * Інакше додаю цю розмітку у div.country-info:
      else {
        document.querySelector('.country-info').innerHTML = markup;

        // додаю стилі:
        const country = document.querySelector('.country');
        country.style.display = 'flex';

        const countryName = document.querySelector('.country-name');
        countryName.style.fontSize = '36px';

        const img = document.querySelector('.country-flag-svg');
        img.style.marginRight = '20px';
        img.style.width = '50px';

        // спамів з однаковим класом є декілька, тому роблю стилі для них циклом:
        const simpleText = document.querySelectorAll('.simpleText');
        for (const span of simpleText) {
          span.style.font = 'caption';
        }
      }
    })

    .catch(onError);
}

// Функція малювання розмітки країни/країн
function renderMarkupCountry(res) {
  // ^ Нижче перезаписую ці змінні у випадку їх відсутності у базі, тому let, а не const

  // Десктруктурізація масиву res:
  let [
    {
      name: { common: commonName },
      capital, // це масив
      population,
      flags: { svg: flag },
      languages, // це об'єкт
    },
  ] = res;

  let countryLanguages = Object.values(languages).join(', '); // кома після останнього значення не додається

  // ^ В базі відсутні деякі дані (undefined), тому перевіряю на наявність, щоби виводити зрозуміле повідомлення замість "undefined":
  if (!commonName) {
    commonName = 'Назва країни невідома';
  }
  if (capital.length === 0) {
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

  // * Якщо довжина масиву від 2 до 10, то роблю розмітку для переліку країн:
  if (res.length > 1) {
    return res.reduce((previousValue, { name: { common: commonName }, flags: { svg: flag } }) => {
      // ^ В базі відсутні деякі дані (undefined), тому перевіряю на наявність, щоби виводити зрозуміле повідомлення замість "undefined":
      if (!commonName) {
        commonName = 'Назва країни невідома';
      }
      if (!flag) {
        flag = 'Прапор невідомий';
      }

      return (
        `
      <li class = "country-item">
      <img src="${flag}" alt="flag.svg" class="country-flag-svg" />
      <h2 class="country-name">${commonName}</h2>
      </li>
      ` + previousValue
      ); // & повертає розмітку для кожного елементу масиву і зшиває її ;
    }, '');
  }

  // * Інакше повертаю розмітку для однієї країни:
  else {
    return `
    <div class="country">
      <img src="${flag}" alt="flag.svg" class="country-flag-svg" width = "200px" />
      <h2 class="country-name">${commonName}</h2>
    </div>
    <h3 class="country-capital">Capital: <span class="simpleText">${capital}</span></h3>
    <h3 class="country-population">Population: <span class="simpleText">${population}</span></h3>
    <h3 class="country-language">Languages: <span class="simpleText">${countryLanguages}</span></h3>
    `;
  }
}

// Функція обробки помилок
function onError(error) {
  clearHTML();

  // Помилки є дві - одна з кодом 200 OK - "Too many matches found. Please enter a more specific name.". А друга з кодом 404  - "Failed to fetch".

  // ??? Не придумав як інакше можна за типом помилки підставляти "info" чи "failure" у Notify
  if (error.message.includes('Too')) {
    Notiflix.Notify.info(error.message);
    console.dir('error :>> ', error);
  } else {
    Notiflix.Notify.failure(error.message);
    console.dir('error :>> ', error);
  }
}

// Функція очищення розмітки
function clearHTML() {
  document.querySelector('.country-list').innerHTML = '';
  document.querySelector('.country-info').innerHTML = '';
}
