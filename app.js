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

// ================================
// Basic detector rendering
// ================================

const canvas = document.getElementById("detector");
const ctx = canvas.getContext("2d");

const bitsDiv = document.getElementById("bits");
const statusDiv = document.getElementById("status");

let clarity = 1.0;
let noiseEnabled = true;

// Resize canvas to fit screen
function resizeCanvas() {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener("resize", resizeCanvas);

// Gaussian random number
function randn() {

    const u = Math.random();
    const v = Math.random();

    return Math.sqrt(-2 * Math.log(u))
        * Math.cos(2 * Math.PI * v);
}

function computeFrame(bits) {

    const rows = 12;
    const cols = 36;

    let frame = Array(rows)
        .fill()
        .map(() => Array(cols).fill(0));

    for (let ion = 0; ion < 8; ion++) {

        if (bits[ion] === 1) {

            for (let r = 0; r < rows; r++) {

                for (let c = 0; c < cols; c++) {

                    frame[r][c] +=
                        ionArrays[ion][r][c] * clarity;
                }
            }
        }
    }

    if (noiseEnabled) {

        for (let r = 0; r < rows; r++) {

            for (let c = 0; c < cols; c++) {

                const sigma =
                    Math.sqrt(frame[r][c] + 1);

                frame[r][c] =
                    Math.max(
                        0,
                        frame[r][c] + randn() * sigma
                    );
            }
        }
    }

    return frame;
}

function drawFrame(frame) {

    const rows = frame.length;
    const cols = frame[0].length;

    resizeCanvas();

    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            const v = frame[r][c];

            const intensity =
                Math.min(
                    255,
                    Math.round(v * 10)
                );

            // crude inferno-like color
            ctx.fillStyle =
                `rgb(${intensity},
                     ${intensity/3},
                     0)`;

            ctx.fillRect(
                c * cellW,
                r * cellH,
                cellW,
                cellH
            );
        }
    }
}

function charToBits(ch) {

    return ch
        .charCodeAt(0)
        .toString(2)
        .padStart(8,"0")
        .split("")
        .map(Number);
}

function showChar(ch) {

    const bits =
        charToBits(ch);

    bitsDiv.innerHTML =
        bits.join(" ");

    statusDiv.innerHTML =
        `'${ch}' → ASCII ${ch.charCodeAt(0)}`;

    const frame =
        computeFrame(bits);

    drawFrame(frame);
}

// Keyboard input
document.addEventListener(
    "keydown",
    event => {

        if(event.key.length === 1){

            showChar(
                event.key
            );
        }
    }
);

// Startup
loadData().then(() => {

    console.log(
        "Ion arrays loaded."
    );

    const blankBits =
        [0,0,0,0,0,0,0,0];

    drawFrame(
        computeFrame(blankBits)
    );
});
