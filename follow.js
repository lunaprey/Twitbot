console.log('Start of scrolling')
//Begin by scrolling to the bottom of the page before clicking the follow buttons
TwitBot.scrollUntilMaxFollowButtons(20, function startClicking() {
  console.log('End of scrolling')
  console.log('Start of clicking')
  TwitBot.clickFollowButtons(TwitBot.getFollowButtonElements(), function () {
    console.log('End of clicking')
    //Navigating back to Twitter Home page
    window.location = "https://twitter.com/"
    chrome.runtime.sendMessage({
      from: 'follow',
      subject: 'FollowFollowersComplete',
    })
  })
})
