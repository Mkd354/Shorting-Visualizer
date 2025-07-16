class SortingVisualizer {
  constructor() {
    this.array = [];
    this.originalArray = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.animationSpeed = 500;
    this.stepCount = 0;
    this.comparisons = 0;
    this.swaps = 0;
    this.currentAlgorithm = "bubble";

    this.initializeElements();
    this.setupEventListeners();
    this.generateRandomArray();
  }

  initializeElements() {
    this.arraySizeInput = document.getElementById("arraySize");
    this.customArrayInput = document.getElementById("customArray");
    this.algorithmSelect = document.getElementById("algorithm");
    this.generateArrayBtn = document.getElementById("generateArray");
    this.setCustomArrayBtn = document.getElementById("setCustomArray");
    this.startSortBtn = document.getElementById("startSort");
    this.pauseSortBtn = document.getElementById("pauseSort");
    this.resetArrayBtn = document.getElementById("resetArray");
    this.speedSlider = document.getElementById("speedSlider");
    this.speedValue = document.getElementById("speedValue");
    this.arrayContainer = document.getElementById("arrayContainer");
    this.currentAlgorithmSpan = document.getElementById("currentAlgorithm");
    this.stepCountSpan = document.getElementById("stepCount");
    this.comparisonsSpan = document.getElementById("comparisons");
    this.swapsSpan = document.getElementById("swaps");
    this.errorMessage = document.getElementById("errorMessage");
  }

  setupEventListeners() {
    this.generateArrayBtn.addEventListener("click", () =>
      this.generateRandomArray()
    );
    this.setCustomArrayBtn.addEventListener("click", () =>
      this.setCustomArray()
    );
    this.startSortBtn.addEventListener("click", () => this.startSorting());
    this.pauseSortBtn.addEventListener("click", () => this.pauseSorting());
    this.resetArrayBtn.addEventListener("click", () => this.resetArray());

    this.speedSlider.addEventListener("input", () => {
      this.speedValue.textContent = this.speedSlider.value;
      this.animationSpeed = 1100 - this.speedSlider.value * 100;
    });

    this.algorithmSelect.addEventListener("change", () => {
      this.currentAlgorithm = this.algorithmSelect.value;
      this.updateAlgorithmInfo();
    });
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");
    setTimeout(() => {
      this.errorMessage.classList.remove("show");
    }, 5000);
  }

  validateInput(input) {
    const numbers = input.split(",").map((str) => str.trim());
    const validNumbers = [];

    for (let numStr of numbers) {
      if (numStr === "") continue;

      const num = parseFloat(numStr);
      if (isNaN(num)) {
        throw new Error(`"${numStr}" is not a valid number`);
      }
      if (num < 1 || num > 1000) {
        throw new Error(`Numbers must be between 1 and 1000. Found: ${num}`);
      }
      validNumbers.push(Math.round(num));
    }

    if (validNumbers.length === 0) {
      throw new Error("Please enter at least one valid number");
    }
    if (validNumbers.length > 100) {
      throw new Error("Maximum 100 numbers allowed");
    }

    return validNumbers;
  }

  generateRandomArray() {
    if (this.isPlaying) return;

    const size = Math.max(
      5,
      Math.min(100, parseInt(this.arraySizeInput.value) || 20)
    );
    this.arraySizeInput.value = size;

    this.array = [];
    for (let i = 0; i < size; i++) {
      this.array.push(Math.floor(Math.random() * 300) + 10);
    }

    this.originalArray = [...this.array];
    this.resetStats();
    this.renderArray();
  }

  setCustomArray() {
    if (this.isPlaying) return;

    const input = this.customArrayInput.value.trim();
    if (!input) {
      this.showError("Please enter comma-separated numbers");
      return;
    }

    try {
      this.array = this.validateInput(input);
      this.originalArray = [...this.array];
      this.resetStats();
      this.renderArray();
      this.customArrayInput.value = "";
    } catch (error) {
      this.showError(error.message);
    }
  }

  resetArray() {
    if (this.isPlaying) {
      this.pauseSorting();
    }

    this.array = [...this.originalArray];
    this.resetStats();
    this.renderArray();
    this.updateControls(false);
  }

  resetStats() {
    this.stepCount = 0;
    this.comparisons = 0;
    this.swaps = 0;
    this.updateStats();
  }

  updateStats() {
    this.stepCountSpan.textContent = `Steps: ${this.stepCount}`;
    this.comparisonsSpan.textContent = `Comparisons: ${this.comparisons}`;
    this.swapsSpan.textContent = `Swaps: ${this.swaps}`;
  }

  updateAlgorithmInfo() {
    const algorithmNames = {
      bubble: "Bubble Sort",
      selection: "Selection Sort",
      insertion: "Insertion Sort",
      quick: "Quick Sort",
    };
    this.currentAlgorithmSpan.textContent = `Current Algorithm: ${
      algorithmNames[this.currentAlgorithm]
    }`;
  }

  renderArray() {
    this.arrayContainer.innerHTML = "";
    const maxValue = Math.max(...this.array);
    const containerHeight = 300;

    this.array.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "array-bar default";
      bar.style.height = `${(value / maxValue) * containerHeight}px`;
      bar.style.width = `${Math.max(
        8,
        Math.min(50, 800 / this.array.length)
      )}px`;
      bar.textContent = value;
      bar.setAttribute("data-index", index);
      this.arrayContainer.appendChild(bar);
    });
  }

  updateBarState(indices, state) {
    const bars = this.arrayContainer.children;

    // Reset all bars to default state
    for (let bar of bars) {
      bar.className = "array-bar default";
    }

    // Apply specific state to target indices
    indices.forEach((index) => {
      if (index >= 0 && index < bars.length) {
        bars[index].className = `array-bar ${state}`;
      }
    });
  }

  async sleep(ms = this.animationSpeed) {
    return new Promise((resolve) => {
      const checkPause = () => {
        if (!this.isPaused && this.isPlaying) {
          setTimeout(resolve, ms);
        } else if (!this.isPlaying) {
          resolve();
        } else {
          setTimeout(checkPause, 50);
        }
      };
      checkPause();
    });
  }

  updateControls(isPlaying) {
    this.isPlaying = isPlaying;
    this.startSortBtn.disabled = isPlaying;
    this.pauseSortBtn.disabled = !isPlaying;
    this.generateArrayBtn.disabled = isPlaying;
    this.setCustomArrayBtn.disabled = isPlaying;
    this.resetArrayBtn.disabled = isPlaying;
    this.algorithmSelect.disabled = isPlaying;
  }

  async startSorting() {
    if (this.array.length === 0) {
      this.showError("Please generate or set an array first");
      return;
    }

    this.updateControls(true);
    this.isPaused = false;

    try {
      switch (this.currentAlgorithm) {
        case "bubble":
          await this.bubbleSort();
          break;
        case "selection":
          await this.selectionSort();
          break;
        case "insertion":
          await this.insertionSort();
          break;
        case "quick":
          await this.quickSort(0, this.array.length - 1);
          break;
      }

      if (this.isPlaying) {
        await this.markAllSorted();
      }
    } catch (error) {
      console.error("Sorting error:", error);
    } finally {
      this.updateControls(false);
    }
  }

  pauseSorting() {
    this.isPaused = !this.isPaused;
    this.pauseSortBtn.innerHTML = this.isPaused
      ? '<i class="fas fa-play"></i> Resume'
      : '<i class="fas fa-pause"></i> Pause';
  }

  async markAllSorted() {
    for (let i = 0; i < this.array.length; i++) {
      if (!this.isPlaying) return;
      this.updateBarState([i], "sorted");
      await this.sleep(50);
    }
  }

  async bubbleSort() {
    const n = this.array.length;

    for (let i = 0; i < n - 1; i++) {
      if (!this.isPlaying) return;

      for (let j = 0; j < n - i - 1; j++) {
        if (!this.isPlaying) return;

        this.stepCount++;
        this.comparisons++;
        this.updateStats();

        // Highlight comparing elements
        this.updateBarState([j, j + 1], "comparing");
        await this.sleep();

        if (this.array[j] > this.array[j + 1]) {
          // Highlight swapping elements
          this.updateBarState([j, j + 1], "swapping");
          await this.sleep();

          // Perform swap
          [this.array[j], this.array[j + 1]] = [
            this.array[j + 1],
            this.array[j],
          ];
          this.swaps++;
          this.updateStats();
          this.renderArray();
          await this.sleep();
        }
      }

      // Mark the last element as sorted
      this.updateBarState([n - i - 1], "sorted");
      await this.sleep();
    }
  }

  async selectionSort() {
    const n = this.array.length;

    for (let i = 0; i < n - 1; i++) {
      if (!this.isPlaying) return;

      let minIndex = i;
      this.updateBarState([i], "comparing");

      for (let j = i + 1; j < n; j++) {
        if (!this.isPlaying) return;

        this.stepCount++;
        this.comparisons++;
        this.updateStats();

        this.updateBarState([minIndex, j], "comparing");
        await this.sleep();

        if (this.array[j] < this.array[minIndex]) {
          minIndex = j;
        }
      }

      if (minIndex !== i) {
        this.updateBarState([i, minIndex], "swapping");
        await this.sleep();

        [this.array[i], this.array[minIndex]] = [
          this.array[minIndex],
          this.array[i],
        ];
        this.swaps++;
        this.updateStats();
        this.renderArray();
        await this.sleep();
      }

      this.updateBarState([i], "sorted");
      await this.sleep();
    }
  }

  async insertionSort() {
    const n = this.array.length;

    for (let i = 1; i < n; i++) {
      if (!this.isPlaying) return;

      let key = this.array[i];
      let j = i - 1;

      this.updateBarState([i], "comparing");
      await this.sleep();

      while (j >= 0 && this.array[j] > key) {
        if (!this.isPlaying) return;

        this.stepCount++;
        this.comparisons++;
        this.updateStats();

        this.updateBarState([j, j + 1], "swapping");
        await this.sleep();

        this.array[j + 1] = this.array[j];
        this.swaps++;
        this.updateStats();
        this.renderArray();
        await this.sleep();

        j--;
      }

      this.array[j + 1] = key;
      this.renderArray();
      await this.sleep();
    }
  }

  async quickSort(low, high) {
    if (low < high) {
      if (!this.isPlaying) return;

      const pivotIndex = await this.partition(low, high);
      if (!this.isPlaying) return;

      await this.quickSort(low, pivotIndex - 1);
      if (!this.isPlaying) return;

      await this.quickSort(pivotIndex + 1, high);
    }
  }

  async partition(low, high) {
    const pivot = this.array[high];
    let i = low - 1;

    this.updateBarState([high], "pivot");
    await this.sleep();

    for (let j = low; j < high; j++) {
      if (!this.isPlaying) return i;

      this.stepCount++;
      this.comparisons++;
      this.updateStats();

      this.updateBarState([j, high], "comparing");
      await this.sleep();

      if (this.array[j] < pivot) {
        i++;
        if (i !== j) {
          this.updateBarState([i, j], "swapping");
          await this.sleep();

          [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
          this.swaps++;
          this.updateStats();
          this.renderArray();
          await this.sleep();
        }
      }
    }

    if (i + 1 !== high) {
      this.updateBarState([i + 1, high], "swapping");
      await this.sleep();

      [this.array[i + 1], this.array[high]] = [
        this.array[high],
        this.array[i + 1],
      ];
      this.swaps++;
      this.updateStats();
      this.renderArray();
      await this.sleep();
    }

    return i + 1;
  }
}

// Initialize the visualizer when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SortingVisualizer();
});
