
console.log('[Twitter.js] Twitter Web Page detected. Twitter.js is now running.')
var UserDisplayName = document.querySelector('.DashboardProfileCard-name > a')
var userTweetName = document.querySelector('.DashboardProfileCard-screennameLink .u-linkComplex-target')
var UserFollowingCount = document.querySelector('.ProfileCardStats-statLink[data-element-term="following_stats"] > .ProfileCardStats-statValue')
var UserFollowerCount = document.querySelector('.ProfileCardStats-statLink[data-element-term="follower_stats"] > .ProfileCardStats-statValue')

if(!UserDisplayName || !UserFollowerCount) {
  console.log('[Twitter.js] User information not found.')
} else {
  console.log('[Twitter.js] Twitter Page load Confirmed.')
  console.log("[Twitter.js] Welcome, " + UserDisplayName.textContent + ". AKA: " + userTweetName.textContent)
  console.log('[Twitter.js] Twitter.js is now listening for data requests')

  //Listens for the UI to be opened
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if ((msg.from === 'popup') && (msg.subject === 'UserInfo')) {
      console.log('[Twitter.js] Request received from client, sending data.')
      var payload = {
        username: UserDisplayName.textContent,
        following: UserFollowingCount.textContent,
        followers: UserFollowerCount.textContent,
        nonFollowbacks: 0
      }

      console.log('[Twitter.js] User data has been sent to client.')
      response(payload)
    }
  })

  //Listens for the Follow button to be clicked
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if ((msg.from === 'popup') && (msg.subject === 'FollowFollowers')){
      console.log('[Twitter.js] Follow Request Received for followers of user ' + msg.followingwho)
      console.log('[Twitter.js] Navigating to users follower page')
      window.location = "https://twitter.com/" + msg.followingwho + "/followers?a=f"
    }
 })

  //Listens for the Unfollow button to be clicked
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if ((msg.from === 'popup') && (msg.subject === 'UnfollowFollowers')) {
      console.log('[Twitter.js] Unfollow Requests Received')
      console.log('[Twitter.js] Navigating to following page of ' + userTweetName.textContent)
      window.location = userTweetName.textContent + "/following?unfollow_nonfollowers"
    }
  })
}
