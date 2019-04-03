//Waits for the popup to be opened before anything below is ran
document.addEventListener('DOMContentLoaded', function () {
  var FollowButton = document.getElementById('addfollowbutton')
  var UnfollowButton = document.getElementById('unfollowbutton')
  var LoadingGif = document.getElementById('loader')
  var followingwho = document.querySelector("#inputfollowers")

  //Waits for Follow Button to be clicked, then msgs runtime with input value
  FollowButton.addEventListener("click", function (event) {
    event.preventDefault()
    console.log('Follow button has been clicked')
    LoadingGif.style.display = "inline"//Show Loading gif
    LoadingGif.style.visibility = "visible"//Show Loading gif
    FollowButton.style.display = "none"//Hide Button
    FollowButton.style.visibility = "hidden"//Hide Button
    console.log('Target: ' + inputfollowers.value)
    //It is necceary to query before sending msg to get the tab ID
    chrome.tabs.query({ 'active': true,'currentWindow': true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: 'popup',
        subject: 'FollowFollowers',
        followingwho: followingwho.value
      })
    })
  })//End of FollowButton EventListener

  //Listens for the twitter.js to finish so that loadbutton can be hidden
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if ((msg.from === 'follow') && (msg.subject === 'FollowFollowersComplete')) {
      setTimeout(function () {
        chrome.tabs.query({ 'active': true,'currentWindow': true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id,{from: 'popup',subject: 'UserInfo'}, function (payload) {
              document.querySelector('#username').textContent = payload.username
              document.querySelector('#following').textContent = payload.following
              document.querySelector('#followers').textContent = payload.followers
              document.querySelector('#non-followbacks').textContent = payload.nonFollowbacks
            })
          })
          console.log('[TwitBot] Following is complete')
          LoadingGif.style.display = "none"//Remove from line so there is no gap
          LoadingGif.style.visibility = "hidden"//Hide from page so user can't see
          FollowButton.style.display = "inline"
          FollowButton.style.visibility = "visible"
          document.querySelector("#inputfollowers").value = ""
      }, 3000)
    }
  })


  //Waits for Follow Button to be clicked, then msgs runtime with input value
  UnfollowButton.addEventListener("click", function (event) {
    event.preventDefault()
    console.log('Unfollow button has been clicked')

    //It is necceary to query before sending msg to get the tab ID
    chrome.tabs.query({'active': true,'currentWindow': true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: 'popup',
        subject: 'UnfollowFollowers',
        followingwho: followingwho.value
      })
    })
  })//End of UnfollowButton EventListener



  //Sends a msg to runtime requesting userinfo so that twitter.js can catch it
  chrome.tabs.query({ 'active': true,'currentWindow': true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { from: 'popup',subject: 'UserInfo' }, function (payload) {
      if (chrome.runtime.lastError) {
        // A common runtime error is "Could not establish connection. Receiving end does not exist.". Usually means the
        // tab was not ready for messages. Safe to ignore, but payload will be empty.

        if (chrome.runtime.lastError.message.indexOf('Receiving end does not exist.') === -1) {
          // Log unknown error that has nothing to do with the expected common runtime error.
          console.error(chrome.runtime.lastError.message);
        }

        console.log("window not found, redirecting...")
        window.location = "./nothere.html"
        return
      }

      document.querySelector('#username').textContent = payload.username
      document.querySelector('#following').textContent = payload.following
      document.querySelector('#followers').textContent = payload.followers
      // This currently isn't available in popup.html, maybe add it later?
      // document.querySelector('#non-followbacks').textContent = payload.nonFollowbacks
    })
  })
}, false)
