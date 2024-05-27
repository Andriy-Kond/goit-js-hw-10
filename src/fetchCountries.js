const END_POINT = 'https://restcountries.com/v3.1/name/';

const searchParams = new URLSearchParams({
  fields: 'name,capital,population,flags,languages',
});

function fetchCountries(inputData) {
  return fetch(`${END_POINT}/${inputData}?${searchParams}`).then(
    //searchParams === fields=name,capital,population,flags,languages
    res => {
      // if (res.status === 200) {
      //   throw new Error('Too many matches found. Please enter a more specific name');
      // }
      // ??? Не знаю як перекинути помилку з потрібним текстом в такому варіанті:
      // if (!res.ok) {
      //   throw new Error(res.statusText);
      //   console.log(res);
      // }
      console.log('res :>> ', res);
      // console.log('res.json() :>> ', res.json());

      return res.json(); // ТУТ ПРОМІС
    }
  );
}

export default { fetchCountries };
