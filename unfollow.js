console.log("unfollow.js has arrived")

// Start.
TwitBot.next({ unfollowMax: 9000, retryMax: 12, retryDuration: 150 },function done() {
  chrome.runtime.sendMessage({
    from: 'follow',
    subject: 'FollowUnfollowersComplete',
  })
})
