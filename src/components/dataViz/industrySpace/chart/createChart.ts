const createChart = () => {
  console.log('chart created');

  const update = () => console.log('chart updated')
  return {update};
}

export default createChart;
