const cubeVars = [
	{dem: 100, color: "#333", score: 1},
	{dem: 80, color: "	#FF0000", score: 2},
	{dem: 60, color: "#00FF00", score: 3},
	{dem: 40, color: "#FF00FF", score: 5},
	{dem: 20, color: "#00F", score: 7}
];


document.addEventListener("DOMContentLoaded", function(event) { 
	const gameField = document.getElementById("game-field");
	const gameFieldWidth = gameField.offsetWidth;   //получить всю длину блока
	const gameFieldHeight = gameField.offsetHeight;
	let cubesArray = [];
	const initialItemsNumber = 10;

	const resultsTable = document.getElementById("results-table");
	const startButton = document.getElementById("start");
	const newGameButton = document.getElementById("new-game");
	const scoreInput = document.getElementById("score");
	const timerInput = document.getElementById("timer");
	const saveButton = document.getElementById("save");
	const popupWrapper = document.getElementById("popup-wrapper");
	const totalScoreSpan = document.getElementById("total-score");
	const nameInput = document.getElementById("name");
	const scoreBoard = JSON.parse(localStorage.getItem("scoreBoard")) || [];

	let score = 0;
	let timer = 2;
	let interval = null;
	let isGameSessionStarted = false;
	let newName = "";


	cubeVarsWrapper = document.getElementById("cube-vars");
	cubeVars.forEach((cubeVar) => {
		const newCube = document.createElement("span");
		newCube.classList.add("cube-preview");
		newCube.innerText = cubeVar.score;
		newCube.style.backgroundColor = cubeVar.color;
		cubeVarsWrapper.append(newCube);
	});

	function toggleGameSession() {
		if (!isGameSessionStarted) {
			isGameSessionStarted = true;
		} else {
			isGameSessionStarted = false;
		}
	}


	function randomInteger(min, max) {
	  // получить случайное число от (min-0.5) до (max+0.5)
	  let rand = min - 0.5 + Math.random() * (max - min + 1);
	  return Math.round(rand);
	};

	function generateId() {
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15 >> c/4).toString(16));
	}

	function generateCube()  {

		const cubeObject = {
			id: generateId(),
		};

		const newCube = document.createElement("div");
		newCube.classList.add("cube");

		const index = randomInteger(0, cubeVars.length - 1);
		cubeObject.score = cubeVars[index].score;
		newCube.style.backgroundColor = cubeVars[index].color;

		['width', 'height'].forEach((key) => {
			newCube.style[key] = cubeVars[index].dem + "px";
		});

		newCube.style.top = Math.abs(randomInteger(0, gameFieldHeight) - cubeVars[index].dem) + "px"; // взять число по модулю
		newCube.style.left = Math.abs(randomInteger(0, gameFieldWidth) - cubeVars[index].dem) + "px";
 
		gameField.appendChild(newCube); //метод добавления домэлемента в родителя

		cubeObject.node = newCube;

		cubesArray.push(cubeObject);
		newCube.addEventListener("click", (event) => onCubeClick(cubeObject, event));
	}

	function onCubeClick(cube) {
		if (isGameSessionStarted) {
			score += cube.score;

			cube.node.remove();          
			cubesArray = cubesArray.filter((cubeItem) => cubeItem.id !== cube.id);
		
			const newCubesToGenerate = randomInteger(0, 2);
			for (let i = 0; i < newCubesToGenerate; i++) {
				generateCube();
			}

			if (!cubesArray.length) {

				for (let i = 0; i < initialItemsNumber; i++) {
					generateCube();
				}
			}

			scoreInput.value = score;
		}
	}

	function cleanup() {
		score = 0;
		timer = 60;
		scoreInput.value = score;
		timerInput.value = timer;

		for (let i = 0; i < cubesArray.length; i++) {
			cubesArray[i].node.remove();
		}
		cubesArray = [];
		isGameSessionStarted = false;
		startButton.innerText = "Start";
		clearInterval(interval);
	}     

	function newGame() {
		// удаляем поле
		cleanup();

		for (let i = 0; i < initialItemsNumber; i++) {
			generateCube();
		}
		console.log(cubesArray);
	}

	function endGame () {
		toggleGameSession();
		popupWrapper.style.display = "flex";
		clearInterval(interval);
		totalScoreSpan.innerText = `your score is: ${score}`;
	}

	function toggleGame() {
		if (!isGameSessionStarted) {
			startButton.innerText = "Pause";	
			toggleGameSession();
			interval = setInterval(() => {
				timer--;
				console.log(timer);
				timerInput.value = timer;
				if (timer === 0) {
					endGame();
				}
			} , 1000);
		} else {
			toggleGameSession();
			clearInterval(interval);
			startButton.innerText = "Start";
		}
	}

	function handleSave() {
		scoreBoard.push({
			name: newName,
			score,
		});
		localStorage.setItem("scoreBoard", JSON.stringify(scoreBoard));
		popupWrapper.style.display = "none";

		const newScoreBody = `<span class="name">${newName}</span><span class="score">${score}</span>`;
		const newScoreElement = document.createElement('div');
		newScoreElement.classList.add("scroe-item");
		newScoreElement.innerHTML = newScoreBody;

		resultsTable.appendChild(newScoreElement);

		cleanup();
	}

	function handleNameInputChange(event) {
		newName = event.target.value;
	}
	
	function showResults() {
		for (let i = 0; i < scoreBoard.length; i++) {
			const newScoreBody = `<span class="name">${scoreBoard[i].name}</span><span class="score">${scoreBoard[i].score}</span>`;
			const newScoreElement = document.createElement('div');
			newScoreElement.classList.add("scroe-item");
			newScoreElement.innerHTML = newScoreBody;
			resultsTable.appendChild(newScoreElement);
		}
	}

	newGameButton.addEventListener("click", newGame);
	startButton.addEventListener("click", toggleGame);
	nameInput.addEventListener("change", handleNameInputChange);
	saveButton.addEventListener("click", handleSave);
	newGame();	
	showResults();
});
 	
	
