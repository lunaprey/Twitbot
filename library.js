console.log('library reporting in')

// Minimize global namespace pollution by establishing our own namespace.
window.TwitBot = {};

/////////////////////////////
// originally from follow.js
/////////////////////////////

TwitBot.getFollowButtonElements = function () {
  return document.querySelectorAll('.user-actions.not-following .user-actions-follow-button')
}

TwitBot.scrollUntilMaxFollowButtons = function (maxFollowButtons, callback, curIterations) {
  if (curIterations > 900) {
    console.log('Aborting, at maximum iterations')
    if (callback) { callback() } // Reached maximum iterations.
    return
  }

  if (curIterations === undefined) {
    curIterations = 0
  } else {
    curIterations++
  }

  var followButtonElements = TwitBot.getFollowButtonElements()
  var numFollowButtons = followButtonElements.length
  console.log('Scroll iteration #%s with %s follow buttons found', curIterations, numFollowButtons)

  if (numFollowButtons < maxFollowButtons) {
    // The number of follow buttons found is still less than the follow buttons maximum, and...
    window.scrollBy(0, 500)

    // Without a timeout to defer calling the scrollUntilMaxFollows
      // function, page rendering is blocked by the while loop's greedy use
      // of code execution. Deferring for 150 milliseconds is still fast.
    setTimeout(function () {
      TwitBot.scrollUntilMaxFollowButtons(maxFollowButtons, callback, curIterations + 1)
    }, 150)
  } else {
    if (callback) { callback() } // Found enough follow buttons
  }
}

//element The button element to click.
//callback Function to call when click is finished.
TwitBot.clickFollowButton = function (buttonElement, callback) {
  //Move screen to location by setting element ID and using hash navigation
  var id = 'target-follow'
  buttonElement.setAttribute('id', id)
  location.hash = ''
  location.hash = id
  setTimeout(function () {
    document.body.scrollTop = document.body.scrollTop - 350
    setTimeout(function () {
      buttonElement.click()
      setTimeout(function () {
        //Set the ID of the element back to what it was
        buttonElement.removeAttribute('id')
        if (callback) { callback() }
      }, 100)//To allow browser to finish rendering page
    }, 100)//allow browser to compensate for button appearing underneath topbar
  }, 100)//Scroll to top
}

 //{ElementList} followButtonElements
 //callback Function to call when all clicks are finished.
 //{Number} Optional current iterations counter, default value of 0.
TwitBot.clickFollowButtons = function (followButtonElements, callback, curIterations) {
  if (curIterations > 300) {
    console.log('Aborting, at maximum iterations')
    if (callback) { callback() } // Reached maximum iterations.
    return
  }

  if (curIterations === undefined) {curIterations = 0}

  var numFollowButtons = followButtonElements.length
  var buttonElement = followButtonElements[curIterations]

  console.log('Click iteration #%s with %s follow buttons found', curIterations, numFollowButtons)

  if (buttonElement) {
    // Element list does have an element at this index, and...
    // The number of iterations is still less than the number of follow buttons found.
    TwitBot.clickFollowButton(buttonElement, function doneClicking() {
      TwitBot.clickFollowButtons(followButtonElements, callback, curIterations + 1)
    })
  } else {
    if (callback) { callback() } // Clicked all of the buttons
  }
}

/////////////////////////////
// end of (originally from follow.js)
/////////////////////////////


/////////////////////////////
// originally from unfollow.js
/////////////////////////////

TwitBot.getLastProcessedFollowedUserElements = function () {
  var elementList = document.querySelectorAll('.ProfileCard.js-actionable-user.twitbot-processed')
  return elementList[elementList.length - 1]
}

TwitBot.getUnprocessedFollowedUserElements = function () {
  return document.querySelectorAll('.ProfileCard.js-actionable-user:not(.twitbot-processed)')
}

TwitBot.isUserFollowed = function (element) {
  return !!element.querySelector('.user-actions.following')
}

TwitBot.isUserFollowing = function (element) {
  return !!element.querySelector('.FollowStatus')
}

TwitBot.getUnfollowButtonElement = function (element) {
  return element.querySelector('.user-actions-follow-button')
}

// {Element} element Element to click.
// {Function} [callback] Function to call when done.
TwitBot.click = function (element, callback) {
  setTimeout(function beforeClick() {
    element.click()
    setTimeout(function afterClick() {
      if (callback) { callback() }
    }, 100) // To allow user some time to see the clicked element.
  }, 100) // To allow user some time to see the clicked element.
}

TwitBot.scroll = function (params, callback) {
  if (document.scrollingElement.scrollTop >= params.scrollTo) {
    if (callback) { callback() }
    return
  }

  document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + params.scrollStep

  setTimeout(function () {
    TwitBot.scroll(params, callback)
  }, 15) // To allow browser to render navigation to element.
}

// {Element} element User element.
// {Object} [state] State object.
// {Number} [state.unfollows] Unfollows available.
// {Function} [callback] Function to call when done.
TwitBot.nextUserElement = function (element, state, callback) {
  if (!state) {state = {}}

  if (state.unfollows < 1) {
    console.log('Aborting, at maximum unfollows')
    if (callback) { callback() } // Reached maximum unfollows.
    return
  }
  element.className += ' ' + 'twitbot-processed'

  TwitBot.scroll({ scrollStep: 300, scrollTo: element.getBoundingClientRect().top }, function doneScrolling() {
    if (TwitBot.isUserFollowed(element) && !TwitBot.isUserFollowing(element)) {
      state.unfollows--
      TwitBot.click(TwitBot.getUnfollowButtonElement(element), function doneClicking() {
        console.log('User iteration #%s, unfollowed, %s unfollows remaining', state.index, state.unfollows)
        if (callback) { callback() }
      })
      return
    } else {
      console.log('User iteration #%s, skipping, %s unfollows remaining', state.index, state.unfollows)
    }

    if (callback) { callback() }
  })
}

// {NodeList} elementList List of user elements.
// {Object} [state] State object.
// {Number} [state.iterations] Iterations available.
// {Number} [state.unfollows] Unfollows available.
// {Function} [callback] Function to call when done.
TwitBot.nextUserElementListItem = function (elementList, state, callback, idx) {
  if (!state) { state = {} }

  if (state.iterations < 1) {
    console.log('Aborting, at maximum iterations')
    if (callback) { callback() } // Reached maximum iterations.
    return
  }

  state.iterations--

  if (idx === undefined) { idx = 0 }

  state.index = idx

  var len = elementList.length
  var ele = elementList[idx]

  console.log('User iteration #%s, %s user elements being processed', idx, len)

  if (ele) {
    TwitBot.nextUserElement(ele, state, function done() {
      TwitBot.nextUserElementListItem(elementList, state, callback, idx + 1)
    })
    return
  }

  if (callback) { callback() } // Processed all user element list entries.
}

// {Object} params Parameters object.
// {Number} params.iterationMax Iterations available.
// {Number} params.unfollowMax Unfollows available.
// {Number} params.retryMax Retries available.
// {Number} params.retryDuration Duration in milliseconds between retries.
// {Object} [state] State object.
// {Number} [state.retries] Retries remaining.
// {Number} [state.iterations] Iterations remaining.
// {Number} [state.unfollows] Unfollows remaining.
// {Function} [callback] Function to call when done.
TwitBot.next = function (params, state, callback) {
  console.log('Next', params)

  if (!state) {
    state = {}
  }

  if (typeof state === 'function') {
    callback = state
    state = undefined
  }

  if (state === undefined) {
    state = {}
  }

  if (state.retries === undefined) {
    state.retries = params.retryMax
  }

  if (state.iterations === undefined) {
    state.iterations = params.iterationMax
  }

  if (state.unfollows === undefined) {
    state.unfollows = params.unfollowMax
  }

  if (state.iterations < 1) {
    console.log('Aborting, at maximum iterations')
    if (callback) { callback() } // Reached maximum iterations.
    return
  }

  if (state.unfollows < 1) {
    console.log('Aborting, at maximum unfollows')
    if (callback) { callback() } // Reached maximum unfollows.
    return
  }

  var elementList = TwitBot.getUnprocessedFollowedUserElements()
  var len = elementList.length

  if (!len) {
    // Found no unprocessed followed user elements.
    // Wait a short while and try again. Maximum of 3 tries.
    if (state.retries) {
      console.log('Retrying, retry %s', state.retries)

      TwitBot.scroll({ scrollStep: 30, scrollTo: document.scrollingElement.scrollTop + 281 }, function doneScrolling() {
        state.retries--
        setTimeout(function () {
          TwitBot.next(params, state, callback)
        }, params.retryDuration)
      })
    } else {
      if (callback) { callback() } // No more retries.
    }
    return
  }

  TwitBot.nextUserElementListItem(elementList, state, function done() {
    state.retries = params.retryMax
    TwitBot.next(params, state, callback)
  })
}

/////////////////////////////
// end of (originally from unfollow.js)
/////////////////////////////
