const END_POINT = 'https://restcountries.com/v2/name/';

// const searchParams = new URLSearchParams({
//   name,
// });

function fetchCountries(inputData) {
  return fetch(`${END_POINT}/${inputData}?fields=name,capital,population,flags,languages`).then(
    res => {
      // ??? Не знаю як перекинути помилку з потрібним текстом в такому варіанті:
      // if (!res.ok) {
      //   console.log(res);
      //   throw new Error(res.statusText);
      // }

      return res.json(); // ТУТ ПРОМІС
    }
  );
}

export default { fetchCountries };
