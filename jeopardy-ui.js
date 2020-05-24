$(async function () {
  const $button = $("button");
  const $tDiv = $("#table-container");

  // for formatting category titles
  function toTitleCase(str) {
    let lcStr = str.toLowerCase();
    return lcStr.replace(/(?:^|\s)\w/g, (match) => {
        return match.toUpperCase();
    });
  }

  /** Fill the HTML table with the categories & cells for questions.
   * - The <thead> should be filled w/a <tr>, and a <td> for each category
   * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
   *   each with a question for each category in a <td>
   *   (initally, just show a "?" where the question/answer would go.)
   */
  async function fillTable() {
    let $tHead = $("<thead>");
    let $tBody = $("<tbody>");
    let $table = $("<table>")
      .prepend($tHead)
      .append($tBody);

    // generate each table cell with '?', add coordinate ID, append to row, row appends to tbody
    for (let j = 0; j < QUESTION_COUNT; j++) {
      let $tRow = $("<tr>");
      for (let i = 0; i < CATEGORY_COUNT; i++) {
        let $qMark = $("<i>")
          .attr("class", "fas fa-question-circle");
        let $tCell = $("<td>")
          .attr("id", `${i}-${j}`)
          .append($qMark);
        $tRow.append($tCell);
      }
      $tBody.append($tRow);
    }

    // generate header cells, apply category title on the way, append to thead
    for (let k = 0; k < CATEGORY_COUNT; k++) {
      let $tCell = $("<th>")
        .attr("id", `cat-${k}`)
        .text(toTitleCase(categories[k].title));
      $tHead.append($tCell);
    }

    // append whole table to container div
    $tDiv.append($table);

  }

  /** Handle clicking on a clue: show the question or answer.
   * 
   * Uses .showing property on clue to determine what to show:
   * - if currently null, show question & set .showing to "question"
   * - if currently "question", show answer & set .showing to "answer"
   * - if currently "answer", ignore click
   * 
   * Each table cell has a unique x-y coordinate ID, which maps to the category
   * and question within that category.
   * 
   * x = category (0-5, going across table, also is index of global array categories)
   * y = question (0-4, going down table, also is index of question array inside chosen category)
   * 
   * example: clicking on a cell with the ID '2-4' will access categories[2].clues[4]
   * 
   * */
  function showQuestionOrAnswer(id) {
    let $clickedCell = $(`#${id}`);
    let category = id.slice(0, 1);
    let question = id.slice(2);

    // shorthand variables for game data
    let theCell = categories[category].clues[question];
    let theQuestion = theCell.question;
    let theAnswer = theCell.answer;

    // check clicked question for what .showing is
    if (theCell.showing === null) { // show the question
      $clickedCell.text(theQuestion);
      theCell.showing = "question";
    }
    else if (theCell.showing === "question") { // show the answer
      $clickedCell.toggleClass("answer")
      $clickedCell.text(theAnswer);
      theCell.showing = "answer";
      $clickedCell.toggleClass("not-allowed");
    }
  }

  /** Wipe the current Jeopardy board, show the loading spinner,
   * and update the button used to fetch data.
   */
  function showLoadingView() {
    $button.text("Loading...").toggleClass("not-allowed");
    $tDiv.empty(); // clear game board
    let $loading = $("<i>")
      .attr("class", "fas fa-spinner fa-pulse loader");
    $tDiv.append($loading);
  }

  /** Remove the loading spinner and update the button used to fetch data. */
  function hideLoadingView() {
    $button.text("Restart!").toggleClass("not-allowed");
    $tDiv.empty(); // clear loading icon before table arrives
  }

  /** Start game: button press
   *
   * - get random category Ids
   * - get data for each category
   * - create HTML table
   * */
  async function setupAndStart() {
    showLoadingView(); // start load screen
    await Category.getAllCategoriesAndQuestions(); // call API and format data
    hideLoadingView(); // hide load screen
    fillTable(); // table creation and labeling
    addListeners(); // apply event listener to table
  }

  /** On click of start / restart button, set up game. */
  $button.on("click", async () => {
    setupAndStart();
  });

  /** On page load, add event handler for clicking clues */
  async function addListeners() {
    const $gameTable = $("table");
    $gameTable.on("click", "td", (evt) => {
      showQuestionOrAnswer(evt.target.id);
    });
  }
});