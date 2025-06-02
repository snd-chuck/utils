/**
 * 시작값과 끝값 사이의 연속된 숫자 배열을 생성합니다.
 * @param {number} start - 시작값
 * @param {number} end - 끝값
 * @returns {Array<number>} 연속된 숫자 배열
 */
const between = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/**
 * 설문 문항의 선택지를 그룹별로 회전(랜덤화)합니다.
 * @param {Array<Array<number>>} optionGroups - 회전할 선택지 그룹들의 배열
 * @param {Object} config - 회전 설정 옵션
 * @param {boolean} config.group - 그룹 간 순서 랜덤화 여부 (기본값: true)
 * @param {boolean} config.option - 그룹 내 선택지 순서 랜덤화 여부 (기본값: true)
 * @param {Array<number>} config.top - 최상단에 고정할 선택지 코드들
 * @param {boolean} config.topShuffle - 최상단 선택지들의 순서 랜덤화 여부 (기본값: true)
 * @param {Array<number>} config.bot - 최하단에 고정할 선택지 코드들
 * @param {boolean} config.botShuffle - 최하단 선택지들의 순서 랜덤화 여부 (기본값: true)
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const groupRotation = (optionGroups = [], config = {}, qnum = null) => {
  config.group = config.group !== undefined ? config.group : true;
  config.option = config.option !== undefined ? config.option : true;
  try {
    if (qnum === null) {
      qnum = cur;
    }

    if (optionGroups.length === 0) return true;
    if (optionGroups.some((group) => !Array.isArray(group))) {
      throw new Error('optionGroups must be an array of arrays');
    }

    const { group: groupRandom, option: optionRandom } = config;
    const question = document.querySelector(`#survey${qnum}`);
    const originOrder = [...question.querySelectorAll('.answer-choice-wrapper')];
    let options = [];
    let fixed = [];

    originOrder.forEach((e) => {
      const rank = Number(e.querySelector('#rank').value);
      if (e.classList.contains('answer-etc') || rank === -1) {
        fixed.push(rank);
      } else {
        options.push(rank);
      }
    });

    options = options.sort((a, b) => a - b);

    let newOrders = [];

    for (const groups of optionGroups) {
      const setGroup = options.filter((e) => groups.includes(e));
      if (optionRandom) {
        setGroup.sort(() => Math.random() - 0.5);
      }
      options = options.filter((e) => !groups.includes(e));
      newOrders.push(setGroup);
    }

    if (options.length > 0) {
      options.forEach((code) => {
        newOrders.push([code]);
      });
    }

    if (groupRandom) {
      newOrders.sort(() => Math.random() - 0.5);
    }

    const answerWrapper = question.querySelector('.answer-wrapper');
    newOrders.forEach((order) => {
      order.forEach((code) => {
        const optionNode = originOrder.find((e) => e.querySelector('#rank').value === String(code));
        if (optionNode) {
          answerWrapper.appendChild(optionNode);
        } else {
          console.warn(`Option with rank ${code} not found`);
        }
      });
    });

    if ('top' in config) {
      const top = config.top;
      if (!Array.isArray(top)) throw new Error('top must be an array');

      const topShuffle = config.topShuffle ?? true;
      if (topShuffle) top.sort(() => Math.random() - 0.5);

      [...top].reverse().forEach((code) => {
        const optionNode = originOrder.find((e) => e.querySelector('#rank').value === String(code));
        optionNode
          ? answerWrapper.insertBefore(optionNode, answerWrapper.firstChild)
          : console.warn(`Top : Option with rank ${code} not found`);
      });
    }

    if ('bot' in config) {
      const bot = config.bot;
      if (!Array.isArray(bot)) throw new Error('bottom must be an array');

      const botShuffle = config.botShuffle ?? true;
      if (botShuffle) bot.sort(() => Math.random() - 0.5);

      bot.forEach((code) => {
        const optionNode = originOrder.find((e) => e.querySelector('#rank').value === String(code));
        optionNode ? answerWrapper.appendChild(optionNode) : console.warn(`Bot : Option with rank ${code} not found`);
      });
    }

    fixed.forEach((code) => {
      const optionNode = originOrder.find((e) => e.querySelector('#rank').value === String(code));
      if (optionNode) {
        answerWrapper.appendChild(optionNode);
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    return true;
  }
};

/**
 * 조건에 따라 선택지를 숨기거나 보여줍니다.
 * @param {Array<number>|number} options - 숨길 선택지 코드들
 * @param {boolean} cond - 숨김 조건 (true일 경우 숨김, false일 경우 표시)
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} hideOption 또는 showOption 함수의 결과
 */
const hide = (options, cond = true, qnum = null) => {
  if (qnum === null) {
    qnum = cur;
  }

  if (cond) {
    return hideOption(qnum, options);
  } else {
    return showOption(qnum, options);
  }
};

/**
 * 조건에 따라 선택지를 보여주거나 숨깁니다.
 * @param {Array<number>|number} options - 보여줄 선택지 코드들
 * @param {boolean} cond - 표시 조건 (true일 경우 표시, false일 경우 숨김)
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} showOption 또는 hideOption 함수의 결과
 */
const show = (options, cond = true, qnum = null) => {
  if (qnum === null) {
    qnum = cur;
  }

  if (cond) {
    return showOption(qnum, options);
  } else {
    return hideOption(qnum, options);
  }
};

/**
 * 조건에 따라 선택지를 비활성화하거나 활성화합니다.
 * @param {Array<number|string>|number|string} options - 비활성화할 선택지 코드들 또는 CSS 선택자
 * @param {boolean} cond - 비활성화 조건 (true일 경우 비활성화, false일 경우 활성화)
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const disabled = (options, cond = true, qnum = null) => {
  try {
    if (qnum === null) {
      qnum = cur;
    }

    const qname = `#survey${qnum}`;
    const currentQuestion = document.querySelector(qname);

    if (!currentQuestion.querySelector('style[data-disabled-style]')) {
      const disabledCSS = `
      <style data-disabled-style>
      ${qname} .answer-choice-wrapper {
          transition: opacity 0.5s ease;
      }
      .disabled-logic {
          pointer-events: none!important;
          opacity: 0.3!important;
      }
      </style>`;
      currentQuestion.insertAdjacentHTML('beforeend', disabledCSS);
    }

    if (!Array.isArray(options)) {
      options = [options];
    }

    options.forEach((option) => {
      const optionType = typeof option;
      const targetElement = optionType === 'number' ? `#answer${qnum}-${option}` : option;
      const targetNode = document.querySelector(`${qname} ${targetElement}`);
      const targetOption = optionType === 'number' ? targetNode.parentNode : targetNode;

      if (cond) {
        targetOption.classList.add('disabled-logic');
        targetNode.readOnly = true;
      } else {
        targetOption.classList.remove('disabled-logic');
        targetNode.readOnly = false;
      }

      if (optionType !== 'number') {
        const childInputs = targetNode.querySelectorAll('input');
        childInputs.forEach((input) => {
          input.readOnly = cond;
        });
      }
    });
  } catch (error) {
    console.error(`Error in optionHandler (disabled):`, error);
  } finally {
    return true;
  }
};

/**
 * 선택지의 위치를 기준 선택지 앞 또는 뒤로 이동시킵니다.
 * @param {number} baseCode - 기준이 되는 선택지 코드
 * @param {Array<number>|number} appendCodes - 이동할 선택지 코드들
 * @param {number} qnum - 대상 문항 번호
 * @param {boolean} isNext - true일 경우 기준 선택지 뒤로, false일 경우 앞으로 이동
 * @returns {boolean} 항상 true 반환
 */
const optionPosition = (baseCode, appendCodes, qnum, isNext) => {
  try {
    if (qnum === null) {
      qnum = cur;
    }
    if (baseCode === null) {
      throw new Error('baseCode is required');
    }

    if (!Array.isArray(appendCodes)) {
      appendCodes = [appendCodes];
    }

    if (isNext) {
      appendCodes = appendCodes.reverse();
    }

    appendCodes.forEach((code) => {
      const base = document.querySelector(`#answer${qnum}-${baseCode}`).parentNode;
      const target = document.querySelector(`#answer${qnum}-${code}`).parentNode;
      base.parentNode.insertBefore(target, isNext ? base.nextSibling : base);
    });
  } catch (e) {
    console.error(e);
  } finally {
    return true;
  }
};

/**
 * 선택지를 기준 선택지 바로 뒤로 이동시킵니다.
 * @param {number|null} baseCode - 기준이 되는 선택지 코드
 * @param {Array<number>} appendCodes - 이동할 선택지 코드들
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} optionPosition 함수의 결과
 */
const nextTo = (baseCode = null, appendCodes = [], qnum = null) => {
  return optionPosition(baseCode, appendCodes, qnum, true);
};

/**
 * 선택지를 기준 선택지 바로 앞으로 이동시킵니다.
 * @param {number|null} baseCode - 기준이 되는 선택지 코드
 * @param {Array<number>} appendCodes - 이동할 선택지 코드들
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} optionPosition 함수의 결과
 */
const beforeTo = (baseCode = null, appendCodes = [], qnum = null) => {
  return optionPosition(baseCode, appendCodes, qnum, false);
};

/**
 * 선택지를 문항의 최상단으로 이동시킵니다.
 * @param {Array<number>} appendCodes - 이동할 선택지 코드들
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const topPosition = (appendCodes = [], qnum = null) => {
  try {
    if (qnum === null) {
      qnum = cur;
    }

    if (!Array.isArray(appendCodes)) {
      appendCodes = [appendCodes];
    }

    appendCodes = appendCodes.reverse();

    const base = document.querySelector(`#survey${qnum} .answer-wrapper`);
    appendCodes.forEach((code) => {
      const target = document.querySelector(`#answer${qnum}-${code}`).parentNode;
      if (target) {
        base.insertBefore(target, base.firstChild);
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    return true;
  }
};

/**
 * 기준 문항의 선택지 순서와 동일하게 파이핑 문항들의 선택지 순서를 맞춥니다.
 * @param {number} setRotationBase - 기준이 되는 문항 번호
 * @param {Array<number>} excludeNumbers - 순서 동기화에서 제외할 문항 번호들
 * @returns {void}
 */
const sameRotationOrder = (setRotationBase, excludeNumbers = []) => {
  if (typeof setRotationBase !== 'number') {
    throw new Error('Please set `setRotationBase` as a number');
  }
  if (!Array.isArray(excludeNumbers)) {
    throw new Error('Please set `excludeNumbers` as an array');
  } else {
    excludeNumbers.forEach((number) => {
      if (typeof number !== 'number') {
        throw new Error('Please set `excludeNumbers` as an array of numbers');
      }
    });
  }

  const getPipingQuestions = (qnumber) => {
    try {
      const surveyForm = document.querySelector('#survey_form');
      const questions = surveyForm.querySelectorAll('.survey');
      return [...questions].filter((q) => Number(q.querySelector('#pipingParent').value) === qnumber);
    } catch (error) {
      console.error('getPipingQuestions function error:', error);
      throw error;
    }
  };

  const getQuestionNumber = (question) => {
    return Number(question.id.replace(/[^0-9]/g, ''));
  };

  try {
    const isDiffAnswer = (answer) => {
      try {
        return !answer.querySelector('.answer-etc') && answer.querySelector(`input[id^='rank']`).value !== '-1';
      } catch (error) {
        console.error('isDiffAnswer function error:', error);
        throw error;
      }
    };

    const findAllPipingQuestions = (baseQid, processedQids = new Set(), result = []) => {
      try {
        if (processedQids.has(baseQid)) return result;

        processedQids.add(baseQid);
        const pipingQuestions = getPipingQuestions(baseQid);

        if (pipingQuestions.length > 0) {
          result.push(...pipingQuestions);

          pipingQuestions.forEach((question) => {
            findAllPipingQuestions(getQuestionNumber(question), processedQids, result);
          });
        }

        return result;
      } catch (error) {
        console.error('findAllPipingQuestions function error:', error);
        throw error;
      }
    };

    try {
      const setRotationQuestions = findAllPipingQuestions(setRotationBase);

      const answerWrappers = '.answer-wrapper .answer-choice-wrapper';
      const baseQuestionAnswers = document.querySelectorAll(`#survey${setRotationBase} ${answerWrappers}`);

      const filteredAnswers = [...baseQuestionAnswers].filter(isDiffAnswer);
      const answerOrderValues = filteredAnswers.map((ans) => ans.querySelector(`input[id^='rank']`).value);

      setRotationQuestions.forEach((question) => {
        try {
          const questionNumber = getQuestionNumber(question);
          if (excludeNumbers.includes(questionNumber)) {
            console.log(`Q${questionNumber} > Random Rotation`);
            return;
          }

          const answerWrapper = question.querySelector('.answer-wrapper');
          const currentAnswers = [...question.querySelectorAll(answerWrappers)];

          const etcAnswers = currentAnswers.filter((ans) => !isDiffAnswer(ans));
          const normalAnswers = currentAnswers.filter(isDiffAnswer);

          const tempContainer = document.createDocumentFragment();

          answerOrderValues.forEach((rank) => {
            try {
              const matchingAnswer = normalAnswers.find(
                (wrapper) => wrapper.querySelector(`input[id^='rank']`).value === rank
              );
              if (matchingAnswer) {
                tempContainer.appendChild(matchingAnswer);
              }
            } catch (error) {
              console.error('Error adjusting answer order:', error);
              throw error;
            }
          });

          etcAnswers.forEach((ans) => tempContainer.appendChild(ans));

          answerWrapper.appendChild(tempContainer);
        } catch (error) {
          console.error('Error processing question:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Error in main logic processing:', error);
      throw error;
    }
  } catch (error) {
    console.error('sameRotationOrder function error:', error);
    throw error;
  }
};

/**
 * 평가형 문항(리커트 척도)의 표시 방식을 설정합니다.
 * @param {Object} options - 평가형 문항 설정 옵션
 * @param {boolean} options.reverse - 척도 순서 역순 표시 여부 (기본값: false)
 * @param {boolean} options.showValue - 척도 값 표시 여부 (기본값: false)
 * @param {number|Array<number>|null} options.qNum - 대상 문항 번호들 (null일 경우 모든 평가형 문항)
 * @param {string|null} options.format - 값 표시 형식 (%d를 점수로 치환)
 * @returns {boolean} 항상 true 반환
 */
const ratingHandler = ({ reverse = false, showValue = false, qNum = null, format = null }) => {
  try {
    const surveyForm = document.querySelector('#survey_form');
    let ratings = [];
    if (qNum === null) {
      const allQuestions = surveyForm.querySelectorAll('.survey');
      ratings = [...allQuestions].filter((question) => [5, 9].includes(Number(question.querySelector('#type').value)));
    } else {
      if (Array.isArray(qNum)) {
        ratings = qNum.map((q) => surveyForm.querySelectorAll(`#survey${q}`));
      } else {
        ratings = [surveyForm.querySelector(`#survey${qNum}`)];
      }
    }

    ratings.forEach((rating) => {
      const cells = rating.querySelectorAll('.answer-eval-wrapper tbody tr:first-child td');
      const score = cells.length;
      const ratingType = Number(rating.querySelector('#type').value);
      const tableFlag = score > 7;

      let ratingCSS = '';
      let tableCellCSS = '';

      if (ratingType === 5) {
        tableCellCSS += `
          td {
              width: 100%;
          }`;

        if (reverse) {
          ratingCSS += `
          #${rating.id} .answer-eval-wrapper {
              tbody tr {
                  ${tableFlag ? 'display: flex;' : ''}
                  flex-direction: row-reverse;

                  ${tableFlag ? tableCellCSS : ''}

                  &:last-child {
                    td:first-child {
                      text-align: right!important;
                    }
                    td:last-child {
                      text-align: left!important;
                    }
                  }
              }
          }
          `;
        }

        if (showValue && !tableFlag) {
          ratingCSS += `
              #${rating.id} table tbody tr:first-child td {
                  position: relative;
              }

              #${rating.id} .cell-value {
                  position: absolute;
                  bottom: -60%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 0.7rem;
                  z-index: 999;
                  color: #2b2a2a;
                  pointer-events: none;
                  font-weight: bold;
                  width: 100%;
                  text-align: center;
              }`;

          cells.forEach((cell) => {
            const cellValue = Number(cell.querySelector('input').value);
            const valueLabel = document.createElement('div');
            valueLabel.classList.add('cell-value');
            valueLabel.textContent = `[${cellValue}점]`;
            if (format !== null) {
              valueLabel.textContent = format.replace('%d', cellValue);
            }
            cell.appendChild(valueLabel);
          });
        }
      }

      if (ratingType === 9) {
        ratingCSS += `
    #${rating.id} .answer .answer-wrapper {
      display: flex;
      flex-direction: column-reverse;
    }
    `;
      }

      const styleTag = document.createElement('style');
      styleTag.textContent = ratingCSS;
      rating.insertBefore(styleTag, rating.firstChild);
    });
  } catch (error) {
    console.error('ratingHandler error:', error);
  } finally {
    return true;
  }
};

/**
 * 현재 문항에 대해 평가형 문항 설정을 적용합니다.
 * @param {Object} obj - ratingHandler에 전달할 옵션 객체
 * @returns {boolean} ratingHandler 함수의 결과
 */
const rating = (obj) => {
  return ratingHandler({ ...obj, qNum: cur });
};

/**
 * 문항 내 텍스트를 동적으로 치환합니다.
 * @param {Object} replacements - 치환할 텍스트 매핑 객체
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const replaceText = (replacements, qnum = null) => {
  try {
    if (qnum === null) {
      qnum = cur;
    }
    const question = document.querySelector(`#survey${qnum}`);
    if (!question) {
      throw new Error(`Q${qnum} is not found`);
    }

    const mainFnc = () => {
      if (typeof replacements !== 'object' || replacements === null) {
        throw new Error('replacements must be an object');
      }

      const answerEvalText = question.querySelectorAll('.answer-eval-text');
      const answerLabel = question.querySelectorAll('.answer-label');
      const description = question.querySelectorAll('.question-description');
      const allElements = [...description, ...answerEvalText, ...answerLabel];

      for (const [key, conditions] of Object.entries(replacements)) {
        const pattern = new RegExp(`{{${key}}}`, 'g');
        const baseClass = `replace-${key.toLowerCase()}`;
        let changeText = conditions;
        if (typeof conditions === 'object' && conditions !== null) {
          const pipe = Object.entries(conditions).find(([key, value]) => value === true);
          if (!pipe || pipe.length === 0) {
            changeText = 'UNDEFINED';
          } else {
            changeText = pipe[0];
          }
        } else {
          changeText = conditions;
        }

        allElements.forEach((element) => {
          const replaceBase = element.querySelectorAll(`.${baseClass}`);
          if (replaceBase.length >= 1) {
            replaceBase.forEach((base) => {
              base.innerHTML = changeText;
            });
          } else {
            const replaceSpan = document.createElement('span');
            replaceSpan.classList.add(baseClass);
            replaceSpan.innerHTML = changeText;

            element.innerHTML = element.innerHTML.replace(pattern, function () {
              return replaceSpan.outerHTML;
            });
          }
        });
      }
    };

    const originReferAnswers = window.referAnswers;
    function referAnswersWrapper(fn) {
      return function (...args) {
        const result = fn.apply(this, args);
        mainFnc();
        return result;
      };
    }

    window.referAnswers = referAnswersWrapper(window.referAnswers);
    referAnswers(qnum);
    common_align(qnum);

    const nxtBtn = document.querySelector(`#survey${qnum} .next-btn-wrapper`);
    nxtBtn.addEventListener('click', () => {
      window.referAnswers = originReferAnswers;
    });
  } catch (error) {
    console.error(error);
  } finally {
    return true;
  }
};

/**
 * 기준 문항의 선택지 순서에 따라 대상 문항의 선택지 순서를 맞춥니다.
 * @param {number} baseQid - 기준이 되는 문항 번호
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const shuffleBy = (baseQid, qnum = null) => {
  const params = { baseQid, qnum };
  for (const [key, value] of Object.entries(params)) {
    if (value === null && key === 'qnum') continue;
    if (typeof value !== 'number') {
      throw new Error(`Please set '${key}' as a number`);
    }
  }

  if (qnum === null) {
    qnum = cur;
  }

  try {
    const answerWrappers = '.answer-wrapper .answer-choice-wrapper';
    const baseQuestion = `#survey${baseQid} ${answerWrappers}`;
    const targetQuestion = `#survey${qnum} ${answerWrappers}`;

    const answerWrapper = document.querySelector(`#survey${qnum} .answer-wrapper`);

    const baseQuestionAnswers = document.querySelectorAll(baseQuestion);
    const answerOrderValues = [...baseQuestionAnswers].map((ans) => ans.querySelector(`input[id^='rank']`).value);

    const targetQuestionAnswers = document.querySelectorAll(targetQuestion);
    const targetAnswers = [...targetQuestionAnswers];
    const targetAnswerValues = targetAnswers.map((ans) => ans.querySelector(`input[id^='rank']`).value);

    const remainAnswers = targetAnswerValues.filter((value) => !answerOrderValues.includes(value) && value !== '-1');
    if (remainAnswers.length > 0) {
      throw new Error(`There are mismatched answers. : ${remainAnswers}`);
    }

    try {
      const tempContainer = document.createDocumentFragment();

      while (answerWrapper.firstChild) {
        tempContainer.appendChild(answerWrapper.firstChild);
      }

      answerOrderValues.forEach((rank) => {
        try {
          const matchingAnswer = targetAnswers.find(
            (wrapper) => wrapper.querySelector(`input[id^='rank']`).value === rank
          );
          if (matchingAnswer) {
            answerWrapper.appendChild(matchingAnswer);
          }
        } catch (error) {
          console.error('Error reordering answers:', error);
          throw error;
        }
      });

      while (tempContainer.firstChild) {
        answerWrapper.appendChild(tempContainer.firstChild);
      }

      if (typeof updateQASummary === 'function') {
        updateQASummary(qnum, `shb: Q${baseQid}`);
      }
    } catch (error) {
      console.error('Error relocating answers:', error);
      throw error;
    }
  } catch (error) {
    console.error('shuffleBy Function Errors:', error);
    throw error;
  } finally {
    return true;
  }
};

/**
 * 선택지 간 상호 배타적 선택 또는 그룹별 제한을 설정합니다.
 * @param {Object} groups - 선택지 그룹 설정 객체
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const thisOrThat = (groups = {}, qnum = null) => {
  try {
    if (qnum === null) qnum = cur;
    if (Object.keys(groups).length === 0) return true;

    const questionId = `#survey${qnum}`;
    const question = document.querySelector(questionId);

    if (!question.querySelector('style[data-this-that-style]')) {
      const thisThatCSS = `
  <style data-this-that-style>
  ${questionId} .answer-choice-wrapper {
      transition: opacity 0.5s ease;
  }
  </style>`;
      question.insertAdjacentHTML('beforeend', thisThatCSS);
    }

    const optionMap = {};
    const groupInfo = {};

    Object.entries(groups).forEach(([group, arr]) => {
      if (!Array.isArray(arr)) return;

      if (arr.every((v) => typeof v === 'number')) {
        groupInfo[group] = { type: 'exclusive', sets: [arr] };
        mapOptionsToGroup(arr, group, 0);
      } else if (arr.length === 2) {
        const agroup = arr[0];
        const bgroup = arr[1];
        const sets = [Array.isArray(agroup) ? agroup : [agroup], Array.isArray(bgroup) ? bgroup : [bgroup]];
        groupInfo[group] = { type: 'pair', sets };
        sets.forEach((set, idx) => mapOptionsToGroup(set, group, idx));
      } else {
        const flatArr = arr.flat();
        groupInfo[group] = { type: 'exclusive', sets: [flatArr] };
        mapOptionsToGroup(flatArr, group, 0);
      }
    });

    function mapOptionsToGroup(options, group, role) {
      options.forEach((code) => {
        if (!optionMap[code]) optionMap[code] = [];
        optionMap[code].push({ group, role });
      });
    }

    question.addEventListener('change', updateDisabled);

    function updateDisabled() {
      const checked = Object.keys(optionMap).filter((code) => {
        const input = document.querySelector(`#answer${qnum}-${code}`);
        return input && input.checked;
      });

      let hasConflict = false;
      const conflictGroups = new Set();

      checked.forEach((checkedCode) => {
        optionMap[checkedCode].forEach(({ group, role }) => {
          const info = groupInfo[group];

          if (info.type === 'exclusive') {
            const sameGroupChecked = checked.filter(
              (code) => code !== checkedCode && optionMap[code].some((x) => x.group === group)
            );
            if (sameGroupChecked.length > 0) {
              hasConflict = true;
              conflictGroups.add(group);
            }
          } else if (info.type === 'pair') {
            const sameRoleChecked = checked.filter(
              (code) => code !== checkedCode && optionMap[code].some((x) => x.group === group && x.role === role)
            );
            if (sameRoleChecked.length > 0) {
              hasConflict = true;
              conflictGroups.add(group);
            }
          }
        });
      });

      if (hasConflict) {
        console.warn('중복 선택이 감지되어 해당 그룹의 응답을 초기화합니다.');
        resetConflictGroups(conflictGroups);
        return;
      }

      Object.keys(optionMap).forEach((code) => {
        let shouldDisable = false;

        optionMap[code].forEach(({ group, role }) => {
          const info = groupInfo[group];

          if (info.type === 'exclusive') {
            checked.forEach((checkedCode) => {
              if (checkedCode !== code && optionMap[checkedCode].some((x) => x.group === group)) {
                shouldDisable = true;
              }
            });
          } else if (info.type === 'pair') {
            checked.forEach((checkedCode) => {
              optionMap[checkedCode].forEach(({ group: checkedGroup, role: checkedRole }) => {
                if (group === checkedGroup && role !== checkedRole) {
                  shouldDisable = true;
                }
              });
            });
          }
        });

        const input = document.querySelector(`#answer${qnum}-${code}`);
        const option = input?.parentNode;
        if (input && option) {
          input.readOnly = shouldDisable;
          option.style.opacity = shouldDisable ? '0.5' : '1';
          option.style.pointerEvents = shouldDisable ? 'none' : '';
        }
      });
    }

    function resetConflictGroups(conflictGroups) {
      Object.keys(optionMap).forEach((code) => {
        const belongsToConflictGroup = optionMap[code].some(({ group }) => conflictGroups.has(group));

        if (belongsToConflictGroup) {
          const input = document.querySelector(`#answer${qnum}-${code}`);
          const option = input?.parentNode;

          if (input && option) {
            turn_off_checkbox($(option));

            input.readOnly = false;

            option.style.opacity = '1';
            option.style.pointerEvents = '';
          }
        }
      });
    }

    updateDisabled();
  } catch (e) {
    console.error('Error in thisOrThat function:', e);
  } finally {
    return true;
  }
};

/**
 * 함수를 안전하게 실행하고 에러를 처리합니다.
 * @param {Function} fn - 실행할 함수
 * @returns {boolean} 항상 true 반환
 */
const exec = (fn) => {
  try {
    fn();
  } catch (error) {
    console.error(error);
  } finally {
    return true;
  }
};

/**
 * 조건 함수를 실행하고 결과를 반환합니다.
 * @param {Function} fn - 실행할 조건 함수
 * @returns {boolean} 함수 실행 결과 또는 에러 시 true
 */
const cond = (fn) => {
  try {
    return fn();
  } catch (error) {
    console.error(error);
    return true;
  }
};

/**
 * 에러 메시지를 표시합니다.
 * @param {string} msg - 표시할 에러 메시지
 * @returns {boolean} 항상 true 반환
 */
const err = (msg) => {
  alert(msg);
  return true;
};

window.softFlag = true;

/**
 * 소프트 에러 메시지를 표시합니다. 첫 번째 호출 시에만 메시지를 표시하고 true를 반환합니다.
 * @param {string} msg - 표시할 에러 메시지
 * @returns {boolean} 첫 번째 호출 시 true, 두 번째 호출 시 false
 */
const softErr = (msg) => {
  if (window.softFlag) {
    alert(msg);
    window.softFlag = false;
    return true;
  } else {
    window.softFlag = true;
    return false;
  }
};

/**
 * 문항에 대한 유효성 검사 함수를 설정합니다.
 * @param {Function} fn - 유효성 검사 함수
 * @param {number|null} target - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} exec 함수의 결과
 */
const validate = (fn, target = null) => {
  const wrappedFn = () => {
    try {
      const result = fn();
      return result;
    } catch (error) {
      return false;
    }
  };

  return exec(() => {
    if (target !== null && typeof target !== 'number') {
      throw new Error('target must be a number');
    }

    let qNumber = target;
    if (qNumber === null) {
      qNumber = cur;
    }

    if (typeof fn !== 'function') {
      throw new Error('fn must be a function');
    }

    const targetQuestion = document.querySelector(`#survey${qNumber}`);
    const targetBtn = targetQuestion.querySelector('.next-btn-wrapper');
    targetBtn.removeAttribute('onclick');
    targetBtn.onclick = null;

    targetBtn.addEventListener('click', () => {
      const validateResult = wrappedFn();

      if (validateResult === true) {
        return;
      } else {
        goNext();
      }
    });
  });
};

/**
 * 텍스트 입력 필드에서 자음/모음 입력을 검사하는 유효성 검사를 설정합니다.
 * @param {number|null} qnum - 대상 문항 번호 (null일 경우 현재 문항)
 * @returns {boolean} 항상 true 반환
 */
const handle = (qnum = null) => {
  if (qnum === null) {
    qnum = cur;
  }

  validate(() => {
    const textAnswers = document.querySelectorAll(`#survey${qnum} input[type='text'], #survey${qnum} textarea`);
    const badAnswer = [...textAnswers].some((answer) => {
      return answer.value.match(/[ㄱ-ㅎㅏ-ㅣ]/);
    });
    if (badAnswer) {
      return err('자/모음이 입력된 답변이 있습니다.');
    }
  });

  return true;
};
