// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

// ~~~ API GLOBALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API GLOBALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~

let categories = [];  // holds all the categories and questions
const BASE_URL = `https://jservice.io/api`;
const QUESTION_COUNT = 5;
const CATEGORY_COUNT = 6;

// ~~~ CATEGORIES AND CLUES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ CATEGORIES AND CLUES ~~~~~~~~~~~~~~~~~~~

class Category {
  /** Get NUM_CATEGORIES random category from API.
  * Returns array of category ids
  */
  static async getCategoryIds() {
    let response = await axios.get(`${BASE_URL}/categories`, {
      params: {
        count: "100",
        offset: Math.floor(Math.random() * (500 - 1) + 1) // RNG to vary offset between each request
      }
    });

    // Lodash selects 6 random categories
    let randomCategories = _.sampleSize(response.data, CATEGORY_COUNT)

    // make new array with only the category IDs
    let categoryIds = randomCategories.map((catObj) => {
      return catObj.id;
    });

    return categoryIds;
  }

  // Fill 'categories' array with 6 objects, each with 5 questions
  static async getAllCategoriesAndQuestions() {
    categories = [];
    let categoryIds = await Category.getCategoryIds();
    for ( let categoryId of categoryIds ) {
      let fullCategory = await Category.getCategory(categoryId);
      categories.push(fullCategory);
    }
    return categories;
  }


  /** Return object with data about a category:
   *
   *  Returns {
   *    title: "Math",
   *    clues: clue-array
   *  }
   *
   * Where clue-array is:
   *   [
   *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
   *      {question: "Bell Jar Author", answer: "Plath", showing: null},
   *      ...
   *   ]
   */
  static async getCategory(catId) {
    let response = await axios.get(`${BASE_URL}/clues`, {
      params: {
        category: catId
      }
    });
    // Lodash selects 5 random questions
    let selectFiveQuestions = _.sampleSize(response.data, QUESTION_COUNT);

    // format each question object inside array
    let questionArray = selectFiveQuestions.map((question) => {
      //
      if (question.answer.startsWith('<i>')) {
        question.answer = question.answer.slice(3, -3);
      }
      return {
        question: question.question,
        answer: question.answer,
        showing: null
      }
    });

    let categoryQuestions = {
      title: response.data[0].category.title, // get category title from 'response'
      clues: questionArray
    }
    return categoryQuestions;
  }
}