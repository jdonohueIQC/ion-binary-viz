const ionArrays = [];

async function loadCSV(path){

    const response = await fetch(path);

    const text = await response.text();

    return text
        .trim()
        .split('\n')
        .map(row =>
             row
               .split(',')
               .map(Number)
        );
}

async function loadData(){

    for(let i=1;i<=8;i++){

        let array =
            await loadCSV(
                `csv/ion_peak_${i}.csv`
            );

        array =
            array.slice(6,-6);

        ionArrays.push(array);
    }
}
