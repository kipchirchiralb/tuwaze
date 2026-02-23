fetch(
  "https://finance.yahoo.com/quote/EURUSD%3DX/history/?period1=1569888000&period2=1771844802",
)
  .then((res) => res.text())
  .then((data) => {
    console.log(data);
  });
