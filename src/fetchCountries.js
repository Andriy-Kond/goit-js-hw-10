const END_POINT = 'https://restcountries.com/v3.1/name/';

const searchParams = new URLSearchParams({
  fields: 'name,capital,population,flags,languages',
});

function fetchCountries(inputData) {
  return fetch(`${END_POINT}/${inputData}?${searchParams}`).then(
    //searchParams === fields=name,capital,population,flags,languages
    res => {
      // ??? Не знаю як перекинути помилку з потрібним текстом в такому варіанті:
      // if (!res.ok) {
      //   console.log(res);
      //   throw new Error(res.statusText);
      // }
      // console.log(res.json());
      return res.json(); // ТУТ ПРОМІС
    }
  );
}

export default { fetchCountries };
